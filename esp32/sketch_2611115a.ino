#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASS";
const char* API_URL   = "https://<project-ref>.supabase.co/functions/v1/gate-scan";
const char* GATE_KEY  = "PASTE-YOUR-RAW-KEY-HERE";

// Definisi Pin
const int BUZZER_PIN = 32;
const int SERVO_PIN  = 25;

// Pengaturan Sudut Palang Servo
const int GATE_CLOSED_ANGLE = 0;
const int GATE_OPEN_ANGLE   = 90;

// Modul buzzer 3-pin umumnya active-low (bunyi saat LOW).
// Tukar LOW dan HIGH di bawah jika buzzer berbunyi terus saat diam.
const int BUZZER_ON  = LOW;
const int BUZZER_OFF = HIGH;

Servo gateServo;

void beep(int durationMs, int count = 1) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER_PIN, BUZZER_ON);
    delay(durationMs);
    digitalWrite(BUZZER_PIN, BUZZER_OFF);
    if (i < count - 1) delay(100);
  }
}

void openGate() {
  beep(150, 1); // 1x beep pendek tanda tiket valid
  gateServo.write(GATE_OPEN_ANGLE);
  delay(3000);  // Palang terbuka selama 3 detik
  gateServo.write(GATE_CLOSED_ANGLE);
}

void denyGate() {
  beep(200, 3); // 3x beep tanda tiket ditolak
}

void setup() {
  Serial.begin(115200);

  // Inisialisasi Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, BUZZER_OFF);

  // Inisialisasi Servo di D25
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400);
  gateServo.write(GATE_CLOSED_ANGLE);

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nReady. Paste QR text and press Enter.");
  beep(80, 2); // 2x beep singkat tanda ESP32 siap
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
    Serial.println(">>> OPEN GATE");
    openGate();
  } else {
    Serial.println(">>> DENIED");
    denyGate();
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