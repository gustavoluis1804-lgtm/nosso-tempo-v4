import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const androidRoot = path.join(root, "android");

if (!fs.existsSync(androidRoot)) {
  console.error("❌ Pasta android não encontrada.");
  console.error("Execute primeiro: npx cap add android");
  process.exit(1);
}

const appId = "com.gustavo.nossotempo";
const packagePath = appId.split(".").join(path.sep);

const javaDir = path.join(
  androidRoot,
  "app",
  "src",
  "main",
  "java",
  packagePath
);

fs.mkdirSync(javaDir, { recursive: true });

const mainActivity = `package ${appId};

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );

        enterImmersiveMode();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (hasFocus) {
            enterImmersiveMode();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        enterImmersiveMode();
    }
}
`;

const mainActivityPath = path.join(
  javaDir,
  "MainActivity.java"
);

fs.writeFileSync(
  mainActivityPath,
  mainActivity,
  "utf8"
);

console.log("✅ MainActivity.java criado corretamente.");


/* =========================
   ANDROID MANIFEST
========================= */

const manifestPath = path.join(
  androidRoot,
  "app",
  "src",
  "main",
  "AndroidManifest.xml"
);

if (!fs.existsSync(manifestPath)) {
  console.error("❌ AndroidManifest.xml não encontrado.");
  process.exit(1);
}

let manifest = fs.readFileSync(
  manifestPath,
  "utf8"
);


/* Nome do aplicativo */

manifest = manifest.replace(
  /android:label="[^"]*"/,
  'android:label="Nosso Tempo"'
);


/* Configurações da MainActivity */

const activityRegex =
  /(<activity\\b[^>]*android:name="\\.MainActivity"[^>]*)(>)/s;

if (!activityRegex.test(manifest)) {
  console.error("❌ MainActivity não encontrada no AndroidManifest.xml");
  process.exit(1);
}

manifest = manifest.replace(
  activityRegex,
  (full, start, end) => {

    let updated = start;

    const attributes = [
      ["android:showWhenLocked", "true"],
      ["android:turnScreenOn", "true"],
      ["android:screenOrientation", "portrait"]
    ];

    for (const [key, value] of attributes) {

      const regex = new RegExp(
        `${key}="[^"]*"`
      );

      if (regex.test(updated)) {

        updated = updated.replace(
          regex,
          `${key}="${value}"`
        );

      } else {

        updated +=
          `\\n            ${key}="${value}"`;

      }
    }

    return updated + end;
  }
);


fs.writeFileSync(
  manifestPath,
  manifest,
  "utf8"
);

console.log("✅ AndroidManifest.xml configurado.");
console.log("✅ Nosso Tempo pronto para compilar.");
