self.onmessage = function(e) {
   const { cars, roadBorders, traffic } = e.data;
   for (let i = 0; i < cars.length; i++) {
      cars[i].update(roadBorders, traffic);
   }
   self.postMessage(cars);
}
