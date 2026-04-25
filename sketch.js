let plants = [];
let bubbles = [];
const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

function setup() {
    // 建立全螢幕畫布
    createCanvas(windowWidth, windowHeight);
    
    // 初始化 50 根水草的資料
    for (let i = 0; i < 50; i++) {
        let baseColor = color(random(colors));
        baseColor.setAlpha(random(100, 180)); // 使用隨機透明度，增強重疊時的層次感

        plants.push({
            x: random(width),                         // x 座標位置
            rid: random(1000),                        // Noise 雜訊偏移量
            clr: baseColor,                           // [屬性] 顏色 (含透明度)
            h: random(height * 0.2, height * 0.6),    // [屬性] 高度調整
            w: random(30, 60),                        // [屬性] 粗細
            speed: random(0.01, 0.03)                 // [屬性] 搖晃頻率
        });
    }
}

function windowResized() {
    // 當視窗大小改變時，重新調整畫布大小以充滿螢幕
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    // 設定背景顏色為 #caf0f8，RGBA 透明度約 0.2 (255 * 0.2 = 51)
    clear(); // 先清除畫布，確保透明度疊加正確
    background(202, 240, 248, 51); 
    
    // 使用標準混合模式，配合透明度產生顏色重疊效果
    blendMode(BLEND);
    
    // 將座標原點移至底部，方便繪製由下往上的水草
    translate(0, height);
    
    // 繪製每一根水草
    for (let p of plants) {
        drawSeaweed(p);
    }

    // 處理水泡邏輯
    handleBubbles();
}

function handleBubbles() {
    // 隨機產生新的水泡
    if (frameCount % 10 === 0) {
        bubbles.push({
            x: random(width),
            y: 20,                // 從底部稍微下方開始
            speed: random(1, 3),   // 上升速度
            size: random(10, 20), // 水泡大小
            popY: -random(height * 0.2, height * 0.8), // 隨機破裂高度
            popped: false,
            popTimer: 0           // 用於控制破裂動畫時間
        });
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
        let b = bubbles[i];

        if (!b.popped) {
            b.y -= b.speed; // 往上升 (y 座標變小)
            if (b.y < b.popY) b.popped = true;

            // 繪製水泡主體 (白色，透明度 0.5)
            noStroke();
            fill(255, 255, 255, 127); // 255 * 0.5 = 127
            ellipse(b.x, b.y, b.size);

            // 繪製水泡上方反光點 (白色，透明度 0.7)
            fill(255, 255, 255, 178); // 255 * 0.7 = 178
            ellipse(b.x - b.size * 0.2, b.y - b.size * 0.2, b.size * 0.3);
        } else {
            // 破裂效果：產生一個向外擴張並變透明的圓圈
            b.popTimer += 5;
            noFill();
            stroke(255, 255, 255, 255 - b.popTimer * 4);
            strokeWeight(2);
            ellipse(b.x, b.y, b.size + b.popTimer);
            
            // 動態結束後移除水泡
            if (b.popTimer > 60) bubbles.splice(i, 1);
        }
    }
}

function drawSeaweed(p) {
    noFill();
    beginShape();
        strokeWeight(p.w); // 使用陣列中的粗細屬性
        stroke(p.clr);     // 使用陣列中的顏色屬性
        strokeCap(ROUND); // 讓線條末端呈現圓角，視覺上更圓滑

        // 利用 i 控制高度，從 0 畫到該水草的高度屬性 p.h
        for (let i = 0; i <= p.h; i += 15) {
            // deltaFactor 確保水草底部固定 (0)，越往頂端搖晃幅度越大 (1)
            let deltaFactor = map(i, 0, p.h, 0, 1, true);
            // 使用 speed 屬性控制雜訊演進速度，產生不同的搖晃頻率
            let deltaX = deltaFactor * (noise(i / 150, frameCount * p.speed, p.rid) - 0.5) * 400;
            
            // 處理 curveVertex 的控制點：第一個點與最後一個點需重複呼叫
            if (i === 0) curveVertex(p.x + deltaX, -i); 
            curveVertex(p.x + deltaX, -i);
            if (i + 15 > p.h) curveVertex(p.x + deltaX, -i);
        }
    endShape();
}