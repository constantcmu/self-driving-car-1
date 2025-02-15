carCanvas.height = window.innerHeight;
carCanvas.width = 200;
networkCanvas.height = window.innerHeight;
networkCanvas.width = 298;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
let N = 100;
const carsCountInput = document.getElementById("carsCount");
const distanceDisplay = document.getElementById("distance");
const bestDistanceDisplay = document.getElementById("bestDistance");
const runningCarsDisplay = document.getElementById("runningCars");

let bestDistance = 0;

carsCountInput.addEventListener("change", (e) => {
   const value = parseInt(e.target.value);
   if (isNaN(value) || value < 100 || value > 1000) {
      alert("กรุณาใส่ค่าระหว่าง 100 ถึง 1000");
      e.target.value = N;
   } else {
      N = value;
   }
});

const cars = generateCars(N);
const traffic = [
   new Car(100, -100, 30, 50, "DUMMY", 2)
];
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")) {
   for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(
         localStorage.getItem("bestBrain"));
      if (i > 0) {
         NeuralNetwork.mutate(cars[i].brain, 0.4);
      }
   }
}

animate();

function animate() {
   for (let i = 0; i < traffic.length; i++) {
      traffic[i].update([], []);
   }
   for (let i = 0; i < cars.length; i++) {
      cars[i].update(road.borders, traffic);
   }
   bestCar = cars.find(
      c => c.y == Math.min(
         ...cars.map(c => c.y)
      ));

   carCanvas.height = window.innerHeight;
   networkCanvas.height = window.innerHeight;

   carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
   road.draw(carCtx);
   for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(carCtx);
   }
   carCtx.globalAlpha = 0.2;
   for (let i = 0; i < cars.length; i++) {
      cars[i].draw(carCtx);
   }
   carCtx.globalAlpha = 1;
   bestCar.draw(carCtx, true, Math.abs(bestCar.y).toFixed(2));

   Visualizer.drawNetwork(networkCtx, bestCar.brain);

   // แสดงระยะทาง
   const currentDistance = Math.abs(bestCar.y).toFixed(2);
   distanceDisplay.innerText = currentDistance;

   // อัพเดทระยะทางที่มากที่สุด
   if (parseFloat(currentDistance) > parseFloat(bestDistance)) {
      bestDistance = currentDistance;
      bestDistanceDisplay.innerText = bestDistance;
   }

   // แสดงจำนวนรถที่ยังวิ่งไม่หยุดและนับเฉพาะคันที่วิ่งไปข้างหน้า
   const runningCars = cars.filter(car => car.speed > 0).length;
   runningCarsDisplay.innerText = runningCars;

   requestAnimationFrame(animate);
}

function generateCars(N) {
   const cars = [];
   for (let i = 1; i <= N; i++) {
      cars.push(new Car(100, 100, 30, 50, "AI"));
   }
   return cars;
}

function save() {
   try {
      const timestamp = new Date().toISOString();
      const modelName = `bestBrain_${timestamp}`;
      localStorage.setItem(modelName, JSON.stringify(bestCar.brain));
      alert("บันทึกสมองของรถเรียบร้อยแล้ว");
   } catch (e) {
      alert("ไม่สามารถบันทึกสมองของรถได้");
   }
}

function discard() {
   try {
      localStorage.removeItem("bestBrain");
      alert("ยกเลิกการบันทึกสมองของรถเรียบร้อยแล้ว");
   } catch (e) {
      alert("ไม่สามารถยกเลิกการบันทึกสมองของรถได้");
   }
}

function restart() {
   traffic.length = 0;
   traffic.push(new Car(100, -100, 30, 50, "DUMMY", 2));

   const newCars = generateCars(N);
   cars.length = 0;
   cars.push(...newCars);

   bestCar = cars[0];

   if (localStorage.getItem("bestBrain")) {
      for (let i = 0; i < cars.length; i++) {
         cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
         if (i > 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.4);
         }
      }
   }
}

function resetSimulation() {
   localStorage.removeItem("bestBrain");
   location.reload();
}

function restartWithNewCount() {
   N = parseInt(carsCountInput.value);
   restart();
}

// เพิ่มฟังก์ชันการปรับปรุงการเรียนรู้
function adjustLearningRate(rate) {
   NeuralNetwork.learningRate = rate;
}

// เพิ่มฟังก์ชันการปรับปรุงการกลายพันธุ์
function adjustMutationRate(rate) {
   NeuralNetwork.mutationRate = rate;
}