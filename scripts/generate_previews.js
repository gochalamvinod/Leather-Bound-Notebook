const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log("Launching headless Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
      "--disable-web-security"
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();
  const screenshotsDir = path.resolve("assets/screenshots");
  const previewsDir = path.resolve("assets/previews");
  const framesDir = path.resolve("assets/frames");

  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(previewsDir, { recursive: true });
  fs.mkdirSync(framesDir, { recursive: true });

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 30000 });
  await sleep(2500);

  let frameIdx = 0;
  async function captureFrame() {
    const pad = String(frameIdx++).padStart(4, "0");
    await page.screenshot({ path: path.join(framesDir, `frame_${pad}.png`) });
  }

  // 1. Screenshot: Login & Google Sign-In
  console.log("Capturing Screenshot 1: Login & Google OAuth...");
  await page.screenshot({ path: path.join(screenshotsDir, "01_login_google_auth.png") });

  // Record login screen frames (0s - 4s: 24 frames)
  for (let i = 0; i < 24; i++) {
    await captureFrame();
    await sleep(100);
  }

  // 2. Click Create Account
  console.log("Switching to Create Account tab...");
  try {
    const pillBtn = await page.$(".pill-btn-outline");
    if (pillBtn) {
      await pillBtn.click();
    } else {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const b = btns.find(x => x.textContent && x.textContent.includes("CREATE ACCOUNT"));
        if (b) b.click();
      });
    }
    await sleep(2000);
    console.log("Capturing Screenshot 2: Registration Wizard...");
    await page.screenshot({ path: path.join(screenshotsDir, "02_registration_wizard.png") });

    // Record registration wizard (4s - 8s: 24 frames)
    for (let i = 0; i < 24; i++) {
      await captureFrame();
      await sleep(100);
    }
  } catch (e) {
    console.warn("Registration tab warning:", e.message);
  }

  // 3. Switch back to Login
  console.log("Switching back to Login tab...");
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(x => x.textContent && x.textContent.includes("SIGN IN"));
      if (b) b.click();
    });
    await sleep(1500);

    // Type admin credentials
    console.log("Typing master credentials...");
    await page.type("#usernameInput", "admin");
    await page.type("#passwordInput", "Vinod@807465");
    await sleep(1000);

    // Record credentials typed (8s - 11s: 18 frames)
    for (let i = 0; i < 18; i++) {
      await captureFrame();
      await sleep(100);
    }

    // Click Unlock button
    console.log("Unlocking vault to trigger 3D Golden Pen morphing and opening...");
    await page.evaluate(() => {
      const submitBtn = document.querySelector("button.pill-btn-submit") || document.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.click();
    });

    // Capture pen morphing and opening (11s - 17s: 36 frames)
    for (let i = 0; i < 36; i++) {
      await captureFrame();
      await sleep(120);
      if (i === 12) {
        console.log("Capturing Screenshot 3: Golden Pen Opening Animation...");
        await page.screenshot({ path: path.join(screenshotsDir, "03_golden_pen_opening.png") });
      }
    }

    await sleep(2500);
    console.log("Capturing Screenshot 4: 3D Leatherbound Vault Spread...");
    await page.screenshot({ path: path.join(screenshotsDir, "04_3d_leatherbound_spread.png") });

    // Record book spread open (17s - 20s: 18 frames)
    for (let i = 0; i < 18; i++) {
      await captureFrame();
      await sleep(100);
    }

    // Trigger page turns
    console.log("Triggering 3D page turn...");
    await page.evaluate(() => {
      const btn = document.querySelector("#nextBtn") || document.querySelector(".page-turn.right");
      if (btn) btn.click();
    });

    // Record 3D page turn (20s - 24s: 24 frames)
    for (let i = 0; i < 24; i++) {
      await captureFrame();
      await sleep(100);
      if (i === 8) {
        console.log("Capturing Screenshot 5: 3D Page Turn Curl Physics...");
        await page.screenshot({ path: path.join(screenshotsDir, "05_3d_page_turn_curl.png") });
      }
    }

    // Open User Profile Modal
    console.log("Opening User Profile Modal...");
    try {
      await page.evaluate(() => {
        const badge = document.querySelector(".avatar-badge") || document.querySelector(".header-user-btn") || document.querySelector("button[title*='user']");
        if (badge) badge.click();
        const btns = Array.from(document.querySelectorAll("button"));
        const pBtn = btns.find(x => x.textContent && (x.textContent.includes("Profile") || x.textContent.includes("Account")));
        if (pBtn) pBtn.click();
      });
      await sleep(1500);
      console.log("Capturing Screenshot 6: User Profile & Account Settings Modal...");
      await page.screenshot({ path: path.join(screenshotsDir, "06_user_profile_modal.png") });

      // Record profile modal (24s - 27s: 18 frames)
      for (let i = 0; i < 18; i++) {
        await captureFrame();
        await sleep(100);
      }
    } catch (e) {
      console.warn("Profile modal warning:", e.message);
    }

    // Fill remaining frames to achieve exactly 180 frames (30.0 seconds at 6 fps)
    while (frameIdx < 180) {
      await captureFrame();
      await sleep(100);
    }

    console.log(`Successfully captured ${frameIdx} choreographed frames (30 seconds total)!`);

  } catch (e) {
    console.error("Error during interaction sequence:", e);
  }

  await browser.close();
  console.log("Headless Chrome session completed.");

  const ffmpeg = "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe";

  console.log("Compiling 30-Second MP4 Video (1080p, 6fps -> 30.0s duration)...");
  try {
    execSync(`"${ffmpeg}" -y -framerate 6 -i assets/frames/frame_%04d.png -c:v libx264 -pix_fmt yuv420p -t 30 assets/previews/leatherbound_preview_30s.mp4`, { stdio: "inherit" });
    console.log("MP4 generated successfully: assets/previews/leatherbound_preview_30s.mp4");
  } catch (e) {
    console.error("MP4 Error:", e.message);
  }

  console.log("Compiling 30-Second WebM Video...");
  try {
    execSync(`"${ffmpeg}" -y -framerate 6 -i assets/frames/frame_%04d.png -c:v libvpx-vp9 -b:v 1500k -t 30 assets/previews/leatherbound_preview_30s.webm`, { stdio: "inherit" });
    console.log("WebM generated successfully: assets/previews/leatherbound_preview_30s.webm");
  } catch (e) {
    console.error("WebM Error:", e.message);
  }

  console.log("Compiling Animated GIF Preview for README...");
  try {
    execSync(`"${ffmpeg}" -y -framerate 6 -i assets/frames/frame_%04d.png -vf "scale=800:-1:flags=lanczos,fps=6" -t 30 assets/previews/leatherbound_preview.gif`, { stdio: "inherit" });
    console.log("GIF generated successfully: assets/previews/leatherbound_preview.gif");
  } catch (e) {
    console.error("GIF Error:", e.message);
  }
}

capture().catch(console.error);