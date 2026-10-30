const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot anti-detect đang ẩn thân tột độ, boss man!');
});

app.listen(PORT, () => {
  console.log(`Server đang lắng nghe ở cổng ${PORT}`);
});

const client = new Client({
  checkUpdate: false,
});

// Hàm tạo độ trễ ngẫu nhiên để đánh lừa hệ thống chống bot của Discord
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm tự động cày orb có tích hợp cơ chế né quét (Anti-Detection)
async function doOrbsAndQuestsStealthy(token) {
  try {
    // Thêm một khoảng trễ ngẫu nhiên từ 5 đến 15 giây trước khi gọi API để giống người thật
    const initialDelay = getRandomDelay(5000, 15000);
    console.log(`[STEALTH] Đang ẩn thân chờ ngẫu nhiên ${initialDelay / 1000} giây trước khi quét...`);
    await sleep(initialDelay);

    const response = await axios.get('https://discord.com/api/v9/users/@me/quests', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const quests = response.data;
    if (!quests || quests.length === 0) {
      console.log('Không tìm thấy nhiệm vụ orb nào, boss man!');
      return;
    }

    for (const q of quests) {
      const questId = q.id;
      const questName = q.config?.messages?.quest_name || 'Nhiệm vụ ẩn';
      const expiresAt = new Date(q.config?.expires_at);
      
      if (new Date() > expiresAt) {
        console.log(`Nhiệm vụ [${questName}] đã tạch hạn, lướt qua nhé boss man.`);
        continue;
      }

      console.log(`[STEALTH] Đang giả lập thao tác làm nhiệm vụ: ${questName} (ID: ${questId})`);

      // Trễ ngẫu nhiên giữa các hành động request để qua mặt anti-bot
      await sleep(getRandomDelay(3000, 8000));

      try {
        const progressRes = await axios.post(`https://discord.com/api/v9/quests/${questId}/progress`, {
          progress: q.config?.target || 100 
        }, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        console.log(`[THÀNH CÔNG] Đã lỏn đẩy xong tiến độ quest: ${questName}`, progressRes.data);
      } catch (err) {
        console.error(`[LỖI PROGRESS] Discord chặn hoặc lỗi quest ${questName}:`, err.response?.data || err.message);
      }
    }
  } catch (err) {
    console.error('Lỗi khi gọi API stealth quest rồi boss man:', err.response?.data || err.message);
  }
}

client.on('ready', async () => {
  console.log(`[ĐÃ ĐĂNG NHẬP AN TOÀN] Tài khoản: ${client.user.tag}`);
  console.log('Chế độ chống quét kích hoạt, đm bố chúng nó cũng không phát hiện được!');

  await doOrbsAndQuestsStealthy(process.env.TOKEN);

  // Vòng lặp định kỳ ngẫu nhiên từ 3 đến 5 tiếng để không bị lặp rập khuôn
  const loopInterval = getRandomDelay(3 * 3600 * 1000, 5 * 3600 * 1000);
  setInterval(async () => {
    console.log('Đang quét ngầm định kỳ với cơ chế né bot...');
    await doOrbsAndQuestsStealthy(process.env.TOKEN);
  }, loopInterval);
});

if (!process.env.TOKEN) {
  console.error('[LỖI TO TO] Thiếu Token trong biến môi trường Render kìa boss man ơi!');
  process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
  console.error('[TÈO RỒI] Token tèo mẹ nó rồi:', err.message);
  process.exit(1);
});
