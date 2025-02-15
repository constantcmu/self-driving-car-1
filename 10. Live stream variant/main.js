carCanvas.height=window.innerHeight;
carCanvas.width=200;
networkCanvas.height=window.innerHeight;
networkCanvas.width=298;

const carCtx=carCanvas.getContext("2d");
const networkCtx=networkCanvas.getContext("2d");
const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
let N=100;
const carsCountInput = document.getElementById("carsCount");
const epochsCountInput = document.getElementById("epochsCount");
const modelSelect = document.getElementById("modelSelect");

carsCountInput.addEventListener("change", (e) => {
   const value = parseInt(e.target.value);
   if (isNaN(value) || value < 100 || value > 1000) {
      alert("กรุณาใส่ค่าระหว่าง 100 ถึง 1000");
      e.target.value = N;
   } else {
      N = value;
   }
});

const cars=generateCars(N);
const traffic=[
   new Car(100,-100,30,50,"DUMMY",2)
];
let bestCar=cars[0];
loadModelList();

if(localStorage.getItem("bestBrain")){
   for(let i=0;i<cars.length;i++){
      cars[i].brain=JSON.parse(
         localStorage.getItem("bestBrain"));
      if(i>0){
         NeuralNetwork.mutate(cars[i].brain,0.4);
      }
   }
}

animate();

function animate(){
   for(let i=0;i<traffic.length;i++){
      traffic[i].update([],[]);
   }
   for(let i=0;i<cars.length;i++){
      cars[i].update(road.borders,traffic);
   }
   bestCar=cars.find(
      c=>c.y==Math.min(
         ...cars.map(c=>c.y)
      ));

   carCanvas.height=window.innerHeight;
   networkCanvas.height=window.innerHeight;
   
   carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);
   road.draw(carCtx);
   for(let i=0;i<traffic.length;i++){
      traffic[i].draw(carCtx);
   }
   carCtx.globalAlpha=0.2;
   for(let i=0;i<cars.length;i++){
      cars[i].draw(carCtx);
   }
   carCtx.globalAlpha=1;
   bestCar.draw(carCtx,true);

   Visualizer.drawNetwork(networkCtx,bestCar.brain);
   
   requestAnimationFrame(animate);
}

function generateCars(N){
   const cars=[];
   for(let i=1;i<=N;i++){
      cars.push(new Car(100,100,30,50,"AI"));
   }
   return cars;
}

function save(){
   try {
      const timestamp = new Date().toISOString();
      const modelName = `bestBrain_${timestamp}`;
      localStorage.setItem(modelName, JSON.stringify(bestCar.brain));
      alert("บันทึกสมองของรถเรียบร้อยแล้ว");
      loadModelList();
   } catch (e) {
      alert("ไม่สามารถบันทึกสมองของรถได้");
   }
}

function discard(){
   try {
      localStorage.removeItem("bestBrain");
      alert("ยกเลิกการบันทึกสมองของรถเรียบร้อยแล้ว");
   } catch (e) {
      alert("ไม่สามารถยกเลิกการบันทึกสมองของรถได้");
   }
}

function restart(){
   traffic.length = 0;
   traffic.push(new Car(100,-100,30,50,"DUMMY",2));
   
   const newCars = generateCars(N);
   cars.length = 0;
   cars.push(...newCars);
   
   bestCar = cars[0];
   
   if(localStorage.getItem("bestBrain")){
      for(let i=0;i<cars.length;i++){
         cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
         if(i>0){
            NeuralNetwork.mutate(cars[i].brain,0.4);
         }
      }
   }
}

function showBestCar(){
   cars.length = 1;
}

function resetSimulation(){
   localStorage.removeItem("bestBrain");
   location.reload();
}

function restartWithNewCount(){
   N = parseInt(carsCountInput.value);
   restart();
}

function startEpochs(){
   const epochs = parseInt(epochsCountInput.value); // จำนวน epoch ที่ต้องการ
   let bestBrain = null;
   let bestScore = Infinity;

   for (let epoch = 0; epoch < epochs; epoch++) {
      restart();
      for (let i = 0; i < cars.length; i++) {
         cars[i].update(road.borders, traffic);
      }
      const currentBestCar = cars.find(
         c => c.y == Math.min(...cars.map(c => c.y))
      );
      const currentScore = currentBestCar.y;

      if (currentScore < bestScore) {
         bestScore = currentScore;
         bestBrain = currentBestCar.brain;
      }
   }

   if (bestBrain) {
      const timestamp = new Date().toISOString();
      const modelName = `bestBrain_${timestamp}`;
      localStorage.setItem(modelName, JSON.stringify(bestBrain));
      alert("บันทึกสมองของรถที่ดีที่สุดเรียบร้อยแล้ว");
      loadModelList();
   }
}

function loadModelList(){
   modelSelect.innerHTML = "";
   for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("bestBrain_")) {
         const option = document.createElement("option");
         option.value = key;
         option.text = key;
         modelSelect.appendChild(option);
      }
   }
}

function loadSelectedModel(){
   const selectedModel = modelSelect.value;
   if (selectedModel) {
      const bestBrain = JSON.parse(localStorage.getItem(selectedModel));
      for (let i = 0; i < cars.length; i++) {
         cars[i].brain = bestBrain;
         if (i > 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.4);
         }
      }
      alert("โหลดสมองของรถเรียบร้อยแล้ว");
   }
}

// เพิ่มฟังก์ชันการปรับปรุงการเรียนรู้
function adjustLearningRate(rate){
   NeuralNetwork.learningRate = rate;
}

// เพิ่มฟังก์ชันการปรับปรุงการกลายพันธุ์
function adjustMutationRate(rate){
   NeuralNetwork.mutationRate = rate;
}