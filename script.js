const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin");
const chancesDiv = document.getElementById("chances");

let chances = 0;
let isSpinning = false;
let account = "";

const prizes = [
  { text: "98", weight: 50, image: "8.png" },
  { text: "198", weight: 30, image: "7.png" },
  { text: "398", weight: 10, image: "1.png" },
  { text: "598", weight: 5, image: "2.png" },
  { text: "798", weight: 3, image: "3.png" },
  { text: "1066", weight: 2, image: "4.png" },
  { text: "18666", weight: 0, image: "5.png" },
  { text: "3666", weight: 0, image: "6.png" },
];

const arc = Math.PI * 2 / prizes.length;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  prizes.forEach((prize, index) => {
    const angle = index * arc;

    ctx.fillStyle = index % 2 === 0 ? "#f8b400" : "#ff6f61";
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, angle, angle + arc);
    ctx.closePath();
    ctx.fill();
  });

  prizes.forEach((prize, index) => {
    const angle = index * arc;
    const img = new Image();
    img.src = prize.image;

    img.onload = () => {
      const imgX = 150 + 90 * Math.cos(angle + arc / 2);
      const imgY = 150 + 90 * Math.sin(angle + arc / 2);
      ctx.save();
      ctx.translate(imgX, imgY);
      ctx.rotate(angle + arc / 2 + Math.PI/2);
      ctx.drawImage(img, -25, -25, 50, 50);
      ctx.restore();

      ctx.save();
      ctx.translate(150, 150);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#202040";
      ctx.font = "16px Noto Sans Bengali";
      ctx.fillText(prize.text, 0, 130);
      ctx.restore();
    }
  });
}

function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (rand < items[i].weight) return i;
    rand -= items[i].weight;
  }
  return 0;
}

function updateChances() {
  chancesDiv.innerText = "বাকি স্পিন সংখ্যা: " + chances;
}

let currentRotation = 0;

// 进入页面时弹出填写账号
window.onload = async () => {
  const { value: userInput } = await Swal.fire({
    title: "আপনার অ্যাকাউন্ট নম্বর দিন",
    input: "text",
    inputLabel: "অ্যাকাউন্ট নম্বর",
    inputPlaceholder: "এখানে লিখুন",
    confirmButtonText: "জমা দিন"
  });

  if (userInput) {
    account = userInput.trim();
    chances = 3;
    updateChances();

    Swal.fire("জমা সম্পন্ন", "এখন আপনি স্পিন করতে পারেন!", "success");

    // 提交账号到服务器
    fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: account })
    });
  }
};

drawWheel();

spinButton.addEventListener("click", () => {
  if (isSpinning || chances <= 0) {
    if (chances <= 0) {
      Swal.fire("দুঃখিত", "আপনার স্পিন সংখ্যা শেষ!", "warning");
    }
    return;
  }

  isSpinning = true;
  chances--;
  updateChances();

  const selected = weightedRandom(prizes);
  const sliceDeg = 360 / prizes.length;
  
  // 这里关键：增加 +90度，补偿偏移
  const targetDeg = 360 * 5 - (selected * sliceDeg + sliceDeg / 2) -90;

  currentRotation = targetDeg % 360;

  canvas.style.transition = "transform 4s ease-out";
  canvas.style.transform = `rotate(${targetDeg}deg)`;

  setTimeout(() => {
    canvas.style.transition = "none";
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    Swal.fire({
      title: "অভিনন্দন!",
      text: "আপনি জিতেছেন: " + prizes[selected].text,
      icon: "success",
      confirmButtonText: "ঠিক আছে"
    });

    // 中奖后，记录中奖信息
    fetch('/submit_win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: account, amount: prizes[selected].text })
    });

    isSpinning = false;
  }, 4000);
});
