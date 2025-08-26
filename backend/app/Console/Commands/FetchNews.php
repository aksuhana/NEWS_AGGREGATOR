<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Article;

class FetchNews extends Command
{
    protected $signature = 'news:fetch {--limit=50}';
    protected $description = 'Fetch articles from providers and store locally';

    public function handle()
    {
        $limit = (int) $this->option('limit');

        $total  = 0;
        $total += $this->try('NewsAPI', fn() => $this->fromNewsApi($limit));
        $total += $this->try('Guardian', fn() => $this->fromGuardian($limit));
        $total += $this->try('NYT RSS', fn() => $this->fromNytRss());
        $total += $this->try('BBC RSS', fn() => $this->fromBbcRss());   // ← third source

        $this->info("Fetched/updated {$total} articles.");
        return Command::SUCCESS;
    }

    private function try(string $label, \Closure $fn): int
    {
        try { return $fn(); }
        catch (\Throwable $e) {
            $this->warn("{$label} error: ".$e->getMessage());
            return 0;
        }
    }

    /* ========== NewsAPI (needs NEWSAPI_KEY) ========== */
    private function fromNewsApi(int $limit = 50): int
    {
        $key = env('NEWSAPI_KEY');
        if (!$key) { $this->warn('NEWSAPI_KEY missing'); return 0; }

        $res = Http::get('https://newsapi.org/v2/top-headlines', [
            'language' => 'en',
            'pageSize' => $limit,
            'apiKey'   => $key,
        ])->json();

        $count = 0;
        foreach (($res['articles'] ?? []) as $a) {
            if (empty($a['url'])) continue;
            Article::updateOrCreate(
                ['external_id' => md5($a['url'])],
                [
                    'title'        => $a['title'] ?? '',
                    'description'  => $a['description'] ?? null,
                    'content'      => $a['content'] ?? null,
                    'url'          => $a['url'],
                    'image_url'    => $a['urlToImage'] ?? null,
                    'source'       => data_get($a, 'source.name', 'NewsAPI'),
                    'author'       => $a['author'] ?? null,
                    'category'     => null,
                    'published_at' => data_get($a, 'publishedAt', now()),
                ]
            );
            $count++;
        }
        $this->info("NewsAPI: {$count}");
        return $count;
    }

    /* ========== Guardian API (needs GUARDIAN_KEY) ========== */
    private function fromGuardian(int $limit = 50): int
    {
        $key = env('GUARDIAN_KEY');
        if (!$key) { $this->warn('GUARDIAN_KEY missing'); return 0; }

        $res = Http::get('https://content.guardianapis.com/search', [
            'api-key'     => $key,
            'show-fields' => 'trailText,thumbnail,body',
            'page-size'   => $limit,
        ])->json();

        $items = data_get($res, 'response.results', []);
        $count = 0;
        foreach ($items as $it) {
            $url = $it['webUrl'] ?? ('https://www.theguardian.com/' . ($it['id'] ?? ''));
            Article::updateOrCreate(
                ['external_id' => md5($url)],
                [
                    'title'        => $it['webTitle'] ?? '',
                    'description'  => data_get($it, 'fields.trailText'),
                    'content'      => strip_tags((string) data_get($it, 'fields.body')),
                    'url'          => $url,
                    'image_url'    => data_get($it, 'fields.thumbnail'),
                    'source'       => 'The Guardian',
                    'author'       => null,
                    'category'     => $it['sectionName'] ?? null,
                    'published_at' => data_get($it, 'webPublicationDate', now()),
                ]
            );
            $count++;
        }
        $this->info("Guardian: {$count}");
        return $count;
    }

    /* ========== NYT RSS (no key) with image extraction ========== */
    private function fromNytRss(): int
    {
        $resp = Http::get('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml');
        if (!$resp->ok()) { $this->warn('NYT RSS failed'); return 0; }

        $xml = @simplexml_load_string($resp->body());
        if (!$xml || !isset($xml->channel->item)) return 0;
        $ns  = $xml->getNamespaces(true);

        $count = 0;
        foreach ($xml->channel->item as $item) {
            $url = (string) $item->link; if (!$url) continue;
            $pub = (string) $item->pubDate;

            // Try media:content for images
            $img = null;
            if ($ns && isset($ns['media'])) {
                $media = $item->children($ns['media']);
                if ($media && isset($media->content)) {
                    $imgAttr = $media->content->attributes();
                    if ($imgAttr && isset($imgAttr['url'])) $img = (string) $imgAttr['url'];
                }
            }

            Article::updateOrCreate(
                ['external_id' => md5($url)],
                [
                    'title'        => (string) $item->title,
                    'description'  => (string) $item->description,
                    'content'      => null,
                    'url'          => $url,
                    'image_url'    => $img,
                    'source'       => 'The New York Times (RSS)',
                    'author'       => null,
                    'category'     => null,
                    'published_at' => $pub ? date('c', strtotime($pub)) : now(),
                ]
            );
            $count++;
        }

        $this->info("NYT RSS: {$count}");
        return $count;
    }

    /* ========== BBC RSS (no key) with image extraction ========== */
    private function fromBbcRss(): int
    {
        $resp = Http::get('https://feeds.bbci.co.uk/news/rss.xml');
        if (!$resp->ok()) { $this->warn('BBC RSS failed'); return 0; }

        $xml = @simplexml_load_string($resp->body());
        if (!$xml || !isset($xml->channel->item)) return 0;
        $ns  = $xml->getNamespaces(true);

        $count = 0;
        foreach ($xml->channel->item as $item) {
            $url = (string) $item->link; if (!$url) continue;
            $pub = (string) $item->pubDate;

            // media:thumbnail or media:content
            $img = null;
            if ($ns && isset($ns['media'])) {
                $media = $item->children($ns['media']);
                if ($media) {
                    if (isset($media->thumbnail)) {
                        $attr = $media->thumbnail->attributes();
                        if ($attr && isset($attr['url'])) $img = (string) $attr['url'];
                    }
                    if (!$img && isset($media->content)) {
                        $attr = $media->content->attributes();
                        if ($attr && isset($attr['url'])) $img = (string) $attr['url'];
                    }
                }
            }

            Article::updateOrCreate(
                ['external_id' => md5($url)],
                [
                    'title'        => (string) $item->title,
                    'description'  => (string) $item->description,
                    'content'      => null,
                    'url'          => $url,
                    'image_url'    => $img,
                    'source'       => 'BBC News',
                    'author'       => null,
                    'category'     => null,
                    'published_at' => $pub ? date('c', strtotime($pub)) : now(),
                ]
            );
            $count++;
        }

        $this->info("BBC RSS: {$count}");
        return $count;
    }
}
