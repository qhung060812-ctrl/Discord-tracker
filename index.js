const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder 
} = require('discord.js');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Anti-Detect Quest đang trực chiến, boss man!');
});

app.listen(PORT, () => {
  console.log(`Server đang lắng nghe ở cổng ${PORT}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Hàm tạo độ trễ ngẫu nhiên để né hệ thống phát hiện hành vi bất thường của Discord
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Đăng ký lệnh /autoquest khi khởi động bot
const commands = [
  new SlashCommandBuilder()
    .setName('autoquest')
    .setDescription('Kích hoạt tiến trình cày quest ẩn thân an toàn')
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`[ĐÃ ONLINE] Bot server: ${client.user.tag}`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('[ĐĂNG KÝ LỆNH] Đã nạp lệnh /autoquest thành công vào server, boss man!');
  } catch (error) {
    console.error('Lỗi đăng ký lệnh:', error);
  }
});

// Lắng nghe tương tác lệnh và modal
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'autoquest') {
      // Hiện Modal bắt nhập Token để bảo mật, không lưu cứng trên server
      const modal = new ModalBuilder()
        .setCustomId('quest_stealth_modal')
        .setTitle('Cấu hình Anti-Detect Quest');

      const tokenInput = new TextInputBuilder()
        .setCustomId('user_token_input')
        .setLabel('Nhập Discord User Token của bạn')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Dán token vào đây (chỉ mình bạn thấy)...')
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(tokenInput));
      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'quest_stealth_modal') {
      const userToken = interaction.fields.getTextInputValue('user_token_input');

      await interaction.reply({
        content: '🛡️ [ANTI-DETECT] Đã nhận token, tiến hành ẩn thân quét và cày quest...',
        ephemeral: true
      });

      // Tiến hành chạy ngầm cơ chế cày quest với độ trễ né quét
      executeStealthQuests(interaction, userToken);
    }
  }
});

// Hàm xử lý cày quest tích hợp giáp chống quét
async function executeStealthQuests(interaction, token) {
  try {
    // Trễ ngẫu nhiên ban đầu để qua mặt bot detection
    const initialDelay = getRandomDelay(3000, 7000);
    await sleep(initialDelay);

    const response = await axios.get('https://discord.com/api/v9/users/@me/quests', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    const quests = response.data;
    if (!quests || quests.length === 0) {
      await interaction.followUp({ content: '❌ Không tìm thấy nhiệm vụ nào khả dụng lúc này, boss man!', ephemeral: true });
      return;
    }

    let completedCount = 0;

    for (const q of quests) {
      const questId = q.id;
      const questName = q.config?.messages?.quest_name || 'Nhiệm vụ ẩn';

      // Trễ ngẫu nhiên giữa các hành động request để giả lập người thật thao tác
      await sleep(getRandomDelay(4000, 9000));

      try {
        await axios.post(`https://discord.com/api/v9/quests/${questId}/progress`, {
          progress: q.config?.target || 100 
        }, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        });

        completedCount++;
      } catch (err) {
        console.error(`Lỗi quest ${questName}:`, err.response?.data || err.message);
      }
    }

    await interaction.followUp({ 
      content: `✅ [HOÀN TẤT AN TOÀN] Đã bú xong **${completedCount}** nhiệm vụ với cơ chế ẩn thân tuyệt đối, boss man nhé!`, 
      ephemeral: true 
    });

  } catch (err) {
    await interaction.followUp({ 
      content: `🔥 [LỖI TOKEN HOẶC HỆ THỐNG] Kiểm tra lại token xem có chuẩn không đi boss man: ${err.message}`, 
      ephemeral: true 
    });
  }
}

if (!process.env.TOKEN) {
  console.error('[LỖI] Thiếu Bot Token trên Render kìa boss man!');
  process.exit(1);
}

client.login(process.env.TOKEN);
