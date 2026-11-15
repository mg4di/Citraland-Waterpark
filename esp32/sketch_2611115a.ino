#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASS";
const char* API_URL   = "https://<project-ref>.supabase.co/functions/v1/gate-scan";
const char* GATE_KEY  = "PASTE-YOUR-RAW-KEY-HERE";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nReady. Paste QR text and press Enter.");
}

void sendScan(String code) {
  code.replace("\"", "");            // keep the JSON body safe
  WiFiClientSecure client;
  client.setInsecure();              // dev only; pin the CA cert for production
  HTTPClient http;
  http.begin(client, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-gate-key", GATE_KEY);

  int status = http.POST("{\"code\":\"" + code + "\"}");
  String body = http.getString();
  Serial.printf("HTTP %d: %s\n", status, body.c_str());

  if (status == 200 && body.indexOf("\"accepted\":true") >= 0) {
    Serial.println(">>> OPEN GATE");   // later: relay / servo / green LED
  } else {
    Serial.println(">>> DENIED");      // later: buzzer / red LED
  }
  http.end();
}

void loop() {
  if (Serial.available()) {
    String code = Serial.readStringUntil('\n');
    code.trim();
    if (code.length() > 0) sendScan(code);
  }
}