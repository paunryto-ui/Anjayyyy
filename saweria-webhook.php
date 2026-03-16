<?php
// ─────────────────────────────────────────
// saweria-webhook.php
// Pasang di server PHP kamu, lalu daftarkan
// URL-nya di Saweria Dashboard → Webhook
// ─────────────────────────────────────────

$data = json_decode(file_get_contents('php://input'), true);

// ── CONFIG ──
$discordWebhook = "https://discord.com/api/webhooks/1482268330390847519/MTQ4MjI3MzU5OTgyMDc5NjAxNg.GdMxtb.3JMhVPe7A1ScasKqbxVoeWKNq4gEwakijZmIeA";

$GIF_PROCESS = "https://cdn.discordapp.com/attachments/1477851080988557438/1483037637991465080/Proyek_Baru_27_ED535A3_1.gif";
$GIF_SUCCESS = "https://cdn.discordapp.com/attachments/1477851080988557438/1483037637681090601/Proyek_Baru_27_B95C3C8.gif";

// ── Ambil data dari Saweria ──
$donator = $data["donator"]   ?? "Anonymous";
$amount  = $data["amount_raw"] ?? "0";
$message = $data["message"]   ?? "-";

// Format nominal
$nominal = "Rp " . number_format((int)$amount, 0, ',', '.');

// ── Payload Discord embed ──
$payload = json_encode([
    "embeds" => [
        [
            "title"       => "🛒 NEW ORDER RECEIVED",
            "description" => implode("\n", [
                "**ORDER IN PROCESS** ⏳",
                "",
                "👤 **User:** {$donator}",
                "💳 **Total:** {$nominal}",
                "📦 **Package:** {$message}",
                "",
                "Menunggu konfirmasi pembayaran...",
            ]),
            "color"     => 0xFF3D9A,
            "thumbnail" => ["url" => $GIF_PROCESS],
            "fields"    => [
                [
                    "name"   => "💰 Nominal",
                    "value"  => "**{$nominal}**",
                    "inline" => true,
                ],
                [
                    "name"   => "🧾 Via",
                    "value"  => "Saweria · saweria.co/Brokolee",
                    "inline" => true,
                ],
            ],
            "footer"    => ["text" => "Web Store · Saweria Webhook"],
            "timestamp" => date("c"),
        ]
    ]
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

// ── Kirim ke Discord ──
$ch = curl_init($discordWebhook);
curl_setopt($ch, CURLOPT_POST,        true);
curl_setopt($ch, CURLOPT_POSTFIELDS,  $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER,  ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// ── Response ke Saweria ──
http_response_code(200);
echo json_encode(["status" => "ok"]);
