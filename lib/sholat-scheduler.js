const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

class SholatScheduler {
  constructor(conn, env, Func) {
    this.conn = conn;
    this.env = env;
    this.Func = Func;
    this.shalatFile = path.join(__dirname, "../shalat.json");
    this.wilayah = { provinsi: "DKI Jakarta", kabkota: "Kota Jakarta" };
    this.cronJobs = [];
    this.init();
  }

  async init() {
    console.log("Initializing Sholat Scheduler...");
    try {
      await this.fetchData();
      this.setupDailyCron();
      this.setupCurrentDayCrons();
      console.log("Sholat Scheduler ready");
    } catch (e) {
      console.error("Sholat Scheduler failed to initialize:", e.message);
      await this.notifyOwner(
        `Sholat Scheduler initialization failed: ${e.message}`,
      );
    }
  }

  async fetchData(retry = 0) {
    try {
      const response = await fetch("https://equran.id/api/v2/shalat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.wilayah),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.code !== 200) throw new Error(data.message || "API Error");

      fs.writeFileSync(this.shalatFile, JSON.stringify(data.data, null, 2));
      console.log("Sholat data updated");
      return data.data;
    } catch (e) {
      console.error(`Fetch attempt ${retry + 1} failed:`, e.message);
      if (retry < 2) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return this.fetchData(retry + 1);
      } else {
        throw e;
      }
    }
  }

  setupDailyCron() {
    // Daily fetch at 00:05
    const dailyJob = cron.schedule(
      "5 0 * * *",
      async () => {
        try {
          await this.fetchData();
          this.setupCurrentDayCrons(); // Re-setup crons for new day
        } catch (e) {
          console.error("Daily fetch failed:", e.message);
          await this.notifyOwner(`Daily sholat fetch failed: ${e.message}`);
        }
      },
      { scheduled: true },
    );

    this.cronJobs.push(dailyJob);
  }

  setupCurrentDayCrons() {
    // Clear existing sholat crons
    this.cronJobs.forEach((job, index) => {
      if (index > 0) {
        // Keep first job (daily fetch)
        job.destroy();
      }
    });
    this.cronJobs = this.cronJobs.slice(0, 1);

    try {
      const jadwal = JSON.parse(fs.readFileSync(this.shalatFile, "utf-8"));
      const today = new Date().getDate();
      const currentJadwal = jadwal.jadwal?.find((j) => j.tanggal === today);

      if (!currentJadwal) {
        console.warn("No schedule found for today");
        return;
      }

      const sholats = [
        { name: "Subuh", time: currentJadwal.subuh },
        { name: "Dzuhur", time: currentJadwal.dzuhur },
        { name: "Ashar", time: currentJadwal.ashar },
        { name: "Maghrib", time: currentJadwal.maghrib },
        { name: "Isya", time: currentJadwal.isya },
      ];

      sholats.forEach(({ name, time }) => {
        const [hour, minute] = time.split(":");
        const cronJob = cron.schedule(
          `${minute} ${hour} * * *`,
          async () => {
            await this.sendReminder(name, time);
          },
          { scheduled: true },
        );

        this.cronJobs.push(cronJob);
      });
    } catch (e) {
      console.error("Failed to setup sholat crons:", e.message);
    }
  }

  async sendReminder(namaSholat, waktu) {
    const message = `Pengingat Waktu Sholat

Telah masuk waktu ${namaSholat}.
Pukul ${waktu}.
Untuk wilayah Jakarta dan sekitarnya.`;

    const groups = Object.keys(global.db.groups || {});
    const activeGroups = groups.filter((jid) => {
      const group = global.db.groups[jid];
      const now = Date.now();
      // Only send to groups active in last 7 days
      return (
        group &&
        group.activity &&
        now - group.activity < 7 * 24 * 60 * 60 * 1000
      );
    });

    let sent = 0,
      failed = 0;
    for (let i = 0; i < activeGroups.length; i++) {
      try {
        await this.conn.sendMessage(activeGroups[i], { text: message });
        sent++;
      } catch (e) {
        console.error(`Failed to send to ${activeGroups[i]}:`, e.message);
        failed++;
      }
      if (i < activeGroups.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    console.log(
      `${namaSholat} reminder sent: ${sent} success, ${failed} failed`,
    );
  }

  async notifyOwner(errorMessage) {
    try {
      await this.conn.sendMessage(this.env.owner + "@s.whatsapp.net", {
        text: errorMessage,
      });
    } catch (e) {
      console.error("Failed to notify owner:", e.message);
    }
  }

  destroy() {
    console.log("Destroying Sholat Scheduler");
    this.cronJobs.forEach((job) => job.destroy());
    this.cronJobs = [];
  }
}

module.exports = (conn, env, Func) => {
  return new SholatScheduler(conn, env, Func);
};
