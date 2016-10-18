

// task.js ライブラリ
const { spawn, sleep } = task;
// document 内のリソースが読み終わるのを待つ
document.addEventListener("DOMContentLoaded", () => {
  // task.js の spawn 関数内では Promise が同期的に記述できる
  spawn(function() {
    // WebI2C API https://github.com/browserobo/WebI2C
    
    var ledValue = 0;
    
    // GPIO へのアクセサを取得
    const gpioAccessor = yield navigator.requestGPIOAccess();
    var ledPort = gpioAccessor.ports.get(198);
    var btnPort = gpioAccessor.ports.get(199);
    
    console.log("export start");
    yield ledPort.export("out");
    yield btnPort.export("in");
    
    btnPort.onchange = function(btnValue){
      console.log("onchange");
      
      if(!btnValue){
        ledValue = ledValue ? 0 : 1;
      }
      ledPort.write(ledValue);
      
    };
    
    // I2C へのアクセサを取得
    const accessor = yield navigator.requestI2CAccess();
    // I2C 0 ポートを使うので、0 を指定してポートを取得
    const port = accessor.ports.get(0);
    // SRF02 超音波センサの初期アドレス 0x70 を指定して slave オブジェクトを取得
    const slave = yield port.open(0x70);
    // ループ   
    for (;;) {
      
      var startTime = new Date().getTime();
      console.log("loop start");
      // ここからは各 I2C デバイスによって制御方法が異なる
      // SRF02 では以下のようにして距離を取得
      yield slave.write8(0x00, 0x00);
      console.log("write8 1",new Date().getTime() - startTime);
      yield sleep(1);
      slave.write8(0x00, 0x51);
      console.log("write8 2",new Date().getTime() - startTime);
      yield sleep(70);
      console.log("70ms sleep",new Date().getTime() - startTime);
      const highBit = yield slave.read8(0x02, true);
      const lowBit = yield slave.read8(0x03, true);
      console.log("read value",new Date().getTime() - startTime);
      // 距離
      const distance = (highBit << 8) + lowBit;

      // 確認用に console.log に表示
      console.log(distance,new Date().getTime() - startTime);
      // HTML 画面に距離を表示
      document.querySelector("#distance").textContent = distance;
      console.log("view distance",new Date().getTime() - startTime);
      if (distance > 30) {
        // 距離が 30cm より遠ければサマリを表示
        document.querySelector("#headline").style.display = "block";
        document.querySelector("#detail").style.display = "none";
      } else {
        // 距離が 30cm より遠ければ詳細を表示
        document.querySelector("#headline").style.display = "none";
        document.querySelector("#detail").style.display = "block";
      }
      console.log("view contents",new Date().getTime() - startTime);
      // 次のセンシングまで 1000ms 待つ
      console.log("wait",new Date().getTime() - startTime);
      yield sleep(1000);
      console.log("loop end",new Date().getTime() - startTime);
    }

  });
  
   
});
