// --- LPC Matching (Plan/Actual) Bar Chart Data ---
const lpcMatchingData = {
    labels: ['บ.ขนส่งขอนแก่น', 'คุณภาวินี', 'บ.ขนส่งศิริสวัสดิ์', 'บ.ขนส่งอุดร', 'LD Logistics', 'บ.คาล.สุพรรณบุรี'],
    plan:   [29, 20, 12, 7, 4, 3],
    actual: [4, 13, 7, 4, 1, 3]
};

// --- Unmatched Reasons Bar Chart Data ---
const unmatchedReasonData = {
    labels: ['บ.ขนส่งขอนแก่น', 'คุณภาวินี', 'บ.ขนส่งศิริสวัสดิ์', 'บ.ขนส่งอุดร', 'LD Logistics', 'บ.คาล.สุพรรณบุรี'],
    reason1: [25, 0, 0, 0, 0, 0], // รถเสีย
    reason2: [0, 5, 5, 0, 0, 0], // ประเภทผิด
    reason3: [0, 0, 0, 3, 3, 3]  // ห้ามสินค้าขึ้นในโซน SCGJ
};

// --- Draw LPC Matching Bar Chart (Modern Grouped Style, with tooltips and diagonal y labels) ---
function drawLPCMatchingChart() {
    const canvas = document.getElementById('lpcMatchingChart');
    const ctx = canvas.getContext('2d');
    // Improve sharpness for HiDPI screens
    const dpr = window.devicePixelRatio || 1;
    if (dpr !== 1) {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = oldWidth * dpr;
        canvas.height = oldHeight * dpr;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 48;
    const chartWidth = (canvas.width / (window.devicePixelRatio || 1)) - 2 * padding;
    const chartHeight = (canvas.height / (window.devicePixelRatio || 1)) - 2 * padding - 18; // leave space for x labels
    const groupCount = lpcMatchingData.labels.length;
    const groupWidth = chartWidth / groupCount;
    const barWidth = groupWidth / 2.2;
    const maxValue = Math.max(...lpcMatchingData.plan, ...lpcMatchingData.actual) + 5;
    // Y axis grid and labels
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.font = '13px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#888';
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
        const value = Math.round(maxValue - (maxValue / 5) * i);
        // Move y-axis label closer to y-axis (reduce left margin)
        ctx.fillText(value.toString(), padding - 6, y + 4);
    }
    // Bars and diagonal y labels
    lpcMatchingData.labels.forEach((label, i) => {
        const groupX = padding + i * groupWidth;
        // Move bars to be side-by-side and centered
        const barGap = 2; // minimal gap between bars
        // Plan (blue)
        const planHeight = (lpcMatchingData.plan[i] / maxValue) * chartHeight;
        ctx.fillStyle = '#1976d2';
        roundRect(ctx, groupX + groupWidth/2 - barWidth - barGap/2, padding + chartHeight - planHeight, barWidth, planHeight, 7, true, false);
        // Actual (orange)
        const actualHeight = (lpcMatchingData.actual[i] / maxValue) * chartHeight;
        ctx.fillStyle = '#ff9800';
        roundRect(ctx, groupX + groupWidth/2 + barGap/2, padding + chartHeight - actualHeight, barWidth, actualHeight, 7, true, false);
        // Value labels
        ctx.fillStyle = '#222';
        ctx.font = 'bold 13px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lpcMatchingData.plan[i], groupX + groupWidth/2 - barWidth/2 - barGap/2, padding + chartHeight - planHeight - 8);
        ctx.fillText(lpcMatchingData.actual[i], groupX + groupWidth/2 + barWidth/2 + barGap/2, padding + chartHeight - actualHeight - 8);
        // Vertical x-axis labels (carrier names)
        ctx.save();
        ctx.translate(groupX + groupWidth/2, padding + chartHeight + 10);
        ctx.rotate(-Math.PI/2);
        ctx.font = '600 10px "Sarabun", "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#263238';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });
    // Y axis
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
}

// --- Add tooltip for LPC Matching chart ---
function addLPCMatchingTooltip() {
    const canvas = document.getElementById('lpcMatchingChart');
    const tooltip = document.getElementById('lpcMatchingTooltip');
    const padding = 48;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding - 18;
    const groupCount = lpcMatchingData.labels.length;
    const groupWidth = chartWidth / groupCount;
    const barWidth = groupWidth / 2.2;
    const maxValue = Math.max(...lpcMatchingData.plan, ...lpcMatchingData.actual) + 5;
    let bars = [];
    lpcMatchingData.labels.forEach((label, i) => {
        const groupX = padding + i * groupWidth;
        // Plan
        const planHeight = (lpcMatchingData.plan[i] / maxValue) * chartHeight;
        bars.push({
            x: groupX + groupWidth/2 - barWidth/2,
            y: padding + chartHeight - planHeight,
            w: barWidth,
            h: planHeight,
            value: lpcMatchingData.plan[i],
            label: label,
            type: 'Plan',
            color: '#1976d2'
        });
        // Actual
        const actualHeight = (lpcMatchingData.actual[i] / maxValue) * chartHeight;
        bars.push({
            x: groupX + groupWidth/2 + barWidth/2,
            y: padding + chartHeight - actualHeight,
            w: barWidth,
            h: actualHeight,
            value: lpcMatchingData.actual[i],
            label: label,
            type: 'Actual',
            color: '#ff9800'
        });
    });
    canvas.onmousemove = function(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let found = null;
        for (let bar of bars) {
            if (mx >= bar.x && mx <= bar.x + bar.w && my >= bar.y && my <= bar.y + bar.h) {
                found = bar;
                break;
            }
        }
        if (found) {
            tooltip.style.display = 'block';
            tooltip.style.left = (found.x + found.w/2 - 30) + 'px';
            tooltip.style.top = (found.y - 38) + 'px';
            tooltip.innerHTML = `<span style='color:${found.color};font-weight:bold;'>${found.type}</span> : <b>${found.value}</b><br><span style='color:#b2dfdb;'>${found.label}</span>`;
        } else {
            tooltip.style.display = 'none';
        }
    };
    canvas.onmouseleave = function() {
        tooltip.style.display = 'none';
    };
}

// --- Draw Unmatched Reasons Bar Chart (Modern Stacked Style) ---
function drawUnmatchedReasonChart() {
    const canvas = document.getElementById('unmatchedReasonChart');
    const ctx = canvas.getContext('2d');
    // Improve sharpness for HiDPI screens
    const dpr = window.devicePixelRatio || 1;
    if (dpr !== 1) {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = oldWidth * dpr;
        canvas.height = oldHeight * dpr;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 48;
    const chartWidth = (canvas.width / (window.devicePixelRatio || 1)) - 2 * padding;
    const chartHeight = (canvas.height / (window.devicePixelRatio || 1)) - 2 * padding - 26;
    const groupCount = unmatchedReasonData.labels.length;
    const barWidth = chartWidth / (groupCount * 1.3);
    const maxValue = Math.max(...unmatchedReasonData.reason1.map((v,i)=>v+unmatchedReasonData.reason2[i]+unmatchedReasonData.reason3[i])) + 5;
    // Y axis grid and labels
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.font = '13px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#888';
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
        const value = Math.round(maxValue - (maxValue / 5) * i);
        ctx.fillText(value.toString(), padding - 18, y + 4);
    }
    // Bars (stacked)
    unmatchedReasonData.labels.forEach((label, i) => {
        const x = padding + i * (barWidth * 1.3);
        let yBase = padding + chartHeight;
        // Reason 1: รถเสีย (gray)
        const h1 = (unmatchedReasonData.reason1[i] / maxValue) * chartHeight;
        ctx.fillStyle = '#bdbdbd';
        roundRect(ctx, x, yBase - h1, barWidth, h1, 7, true, false);
        if (unmatchedReasonData.reason1[i] > 0) {
            ctx.fillStyle = '#222';
            ctx.font = 'bold 13px Segoe UI, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(unmatchedReasonData.reason1[i], x + barWidth/2, yBase - h1/2);
        }
        yBase -= h1;
        // Reason 2: ประเภทผิด (orange)
        const h2 = (unmatchedReasonData.reason2[i] / maxValue) * chartHeight;
        ctx.fillStyle = '#ff9800';
        roundRect(ctx, x, yBase - h2, barWidth, h2, 7, true, false);
        if (unmatchedReasonData.reason2[i] > 0) {
            ctx.fillStyle = '#222';
            ctx.font = 'bold 13px Segoe UI, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(unmatchedReasonData.reason2[i], x + barWidth/2, yBase - h2/2);
        }
        yBase -= h2;
        // Reason 3: ห้ามสินค้าขึ้นในโซน SCGJ (red)
        const h3 = (unmatchedReasonData.reason3[i] / maxValue) * chartHeight;
        ctx.fillStyle = '#e53935';
        roundRect(ctx, x, yBase - h3, barWidth, h3, 7, true, false);
        if (unmatchedReasonData.reason3[i] > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Segoe UI, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(unmatchedReasonData.reason3[i], x + barWidth/2, yBase - h3/2);
        }
        // X axis labels (carrier names, vertical alignment like LPC Matching chart)
        ctx.save();
        ctx.translate(x + barWidth/2, padding + chartHeight + 10); // match LPC Matching label position
        ctx.rotate(-Math.PI/2); // vertical
        ctx.font = '600 9px "Sarabun", "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#263238';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });
    // Y axis
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
}

// --- Helper: Draw rounded rectangle ---
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// --- Helper: Draw legend ---
function drawLegend(ctx, items, x, y, boxSize) {
    let offset = 0;
    items.forEach(item => {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = item.color;
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1.2;
        ctx.rect(x + offset, y, boxSize, boxSize-2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#444';
        ctx.font = '13px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, x + offset + boxSize + 7, y + boxSize - 5);
        offset += boxSize + 70;
    });
}

// --- Init new charts ---
function initLPCDashboards() {
    drawLPCMatchingChart();
    drawUnmatchedReasonChart();
    addLPCMatchingTooltip();
}
window.addEventListener('DOMContentLoaded', initLPCDashboards);
window.addEventListener('resize', () => { setTimeout(initLPCDashboards, 100); });

// --- Sample data for charts (based on the first image) ---
const bhData = {
    days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    bh: [30, 25, 30, 25, 20, 15, 18, 20, 15, 10, 12, 15, 18, 20, 15, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    matching: [20, 15, 20, 15, 10, 12, 15, 18, 12, 8, 10, 12, 15, 18, 12, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
const hhData = {
    days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    hh: [25, 20, 25, 30, 12, 15, 25, 23, 20, 22, 15, 20, 18, 15, 10, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    matching: [18, 15, 18, 20, 10, 12, 16, 18, 15, 18, 12, 15, 14, 12, 8, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

function drawChart(canvasId, data, primaryLabel) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 48;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / (data.days.length * 1.2);
    const maxValue = Math.max(...data[primaryLabel.toLowerCase()], ...data.matching) + 5;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.font = '13px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'right';
        const value = Math.round(maxValue - (maxValue / 5) * i);
        ctx.fillText(value.toString(), padding - 12, y + 4);
    }
    data.days.forEach((day, index) => {
        const x = padding + index * (barWidth * 1.2);
        if (data[primaryLabel.toLowerCase()][index] > 0) {
            const primaryHeight = (data[primaryLabel.toLowerCase()][index] / maxValue) * chartHeight;
            ctx.fillStyle = '#009966';
            ctx.fillRect(x, padding + chartHeight - primaryHeight, barWidth * 0.8, primaryHeight);
            const matchingHeight = (data.matching[index] / maxValue) * chartHeight;
            ctx.fillStyle = '#222';
            ctx.fillRect(x + barWidth * 0.2, padding + chartHeight - matchingHeight, barWidth * 0.6, matchingHeight);
        }
        if (day % 5 === 1 || day === 1) {
            ctx.fillStyle = '#444';
            ctx.font = '12px Segoe UI, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(day.toString(), x + barWidth * 0.4, padding + chartHeight + 20);
        }
    });
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
}

function addBarTooltip(canvasId, data, primaryLabel, tooltipId) {
    const canvas = document.getElementById(canvasId);
    const tooltip = document.getElementById(tooltipId);
    const padding = 48;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / (data.days.length * 1.2);
    const maxValue = Math.max(...data[primaryLabel.toLowerCase()], ...data.matching) + 5;
    let bars = [];
    data.days.forEach((day, index) => {
        const x = padding + index * (barWidth * 1.2);
        if (data[primaryLabel.toLowerCase()][index] > 0) {
            const primaryHeight = (data[primaryLabel.toLowerCase()][index] / maxValue) * chartHeight;
            bars.push({
                x: x,
                y: padding + chartHeight - primaryHeight,
                w: barWidth * 0.8,
                h: primaryHeight,
                value: data[primaryLabel.toLowerCase()][index],
                label: primaryLabel,
                day: day,
                color: '#009966'
            });
            const matchingHeight = (data.matching[index] / maxValue) * chartHeight;
            bars.push({
                x: x + barWidth * 0.2,
                y: padding + chartHeight - matchingHeight,
                w: barWidth * 0.6,
                h: matchingHeight,
                value: data.matching[index],
                label: 'Matching',
                day: day,
                color: '#222'
            });
        }
    });
    canvas.onmousemove = function(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let found = null;
        for (let bar of bars) {
            if (mx >= bar.x && mx <= bar.x + bar.w && my >= bar.y && my <= bar.y + bar.h) {
                found = bar;
                break;
            }
        }
        if (found) {
            tooltip.style.display = 'block';
            tooltip.style.left = (found.x + found.w/2 - 30) + 'px';
            tooltip.style.top = (found.y - 38) + 'px';
            tooltip.innerHTML = `<span style='color:${found.color};font-weight:bold;'>${found.label}</span> : <b>${found.value}</b><br><span style='color:#b2dfdb;'>Day : ${found.day}</span>`;
        } else {
            tooltip.style.display = 'none';
        }
    };
    canvas.onmouseleave = function() {
        tooltip.style.display = 'none';
    };
}

function initCharts() {
    setTimeout(() => {
        drawChart('bhChart', bhData, 'BH');
        drawChart('hhChart', hhData, 'HH');
        addBarTooltip('bhChart', bhData, 'BH', 'bhTooltip');
        addBarTooltip('hhChart', hhData, 'HH', 'hhTooltip');
    }, 500);
}
window.addEventListener('load', initCharts);
window.addEventListener('resize', () => { setTimeout(initCharts, 100); });

// Set default dates to current date
const today = new Date().toISOString().split('T')[0];
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('hh-date').value = today;
    document.getElementById('bh-date').value = today;
});

// --- Province to Amphur Mapping (Thai) ---
const provinceToAmphur = {
    'กรุงเทพมหานคร': ['เขตพระนคร', 'เขตดุสิต', 'เขตหนองจอก', 'เขตบางรัก', 'เขตบางเขน', 'เขตบางกะปิ', 'เขตปทุมวัน', 'เขตป้อมปราบศัตรูพ่าย', 'เขตพระโขนง', 'เขตมีนบุรี', 'เขตลาดกระบัง', 'เขตยานนาวา', 'เขตสัมพันธวงศ์', 'เขตพญาไท', 'เขตธนบุรี', 'เขตบางกอกใหญ่', 'เขตห้วยขวาง', 'เขตคลองสาน', 'เขตตลิ่งชัน', 'เขตบางกอกน้อย', 'เขตบางขุนเทียน', 'เขตภาษีเจริญ', 'เขตหนองแขม', 'เขตราษฎร์บูรณะ', 'เขตบางพลัด', 'เขตดินแดง', 'เขตบึงกุ่ม', 'เขตสาทร', 'เขตบางซื่อ', 'เขตจตุจักร', 'เขตบางคอแหลม', 'เขตประเวศ', 'เขตคลองเตย', 'เขตสวนหลวง', 'เขตจอมทอง', 'เขตดอนเมือง', 'เขตราชเทวี', 'เขตลาดพร้าว', 'เขตวัฒนา', 'เขตบางแค', 'เขตหลักสี่', 'เขตสายไหม', 'เขตคันนายาว', 'เขตสะพานสูง', 'เขตวังทองหลาง', 'เขตคลองสามวา', 'เขตบางนา', 'เขตทวีวัฒนา', 'เขตทุ่งครุ', 'เขตบางบอน'],
    'กระบี่': ['เมืองกระบี่', 'เขาพนม', 'เกาะลันตา', 'คลองท่อม', 'อ่าวลึก', 'ปลายพระยา', 'ลำทับ', 'เหนือคลอง'],
    'กาญจนบุรี': ['เมืองกาญจนบุรี', 'ไทรโยค', 'บ่อพลอย', 'ศรีสวัสดิ์', 'ท่ามะกา', 'ท่าม่วง', 'ทองผาภูมิ', 'สังขละบุรี', 'ด่านมะขามเตี้ย', 'หนองปรือ', 'ห้วยกระเจา'],
    'กาฬสินธุ์': ['เมืองกาฬสินธุ์', 'นามน', 'กมลาไสย', 'ร่องคำ', 'กุฉินารายณ์', 'เขาวง', 'ยางตลาด', 'ห้วยเม็ก', 'สหัสขันธ์', 'คำม่วง', 'ท่าคันโท', 'หนองกุงศรี', 'สมเด็จ', 'ห้วยผึ้ง', 'สามชัย', 'นาคู', 'ดอนจาน', 'ฆ้องชัย'],
    'เชียงใหม่': ['เมืองเชียงใหม่', 'จอมทอง', 'แม่แจ่ม', 'เชียงดาว', 'ดอยสะเก็ด', 'แม่แตง', 'แม่ริม', 'สะเมิง', 'ฝาง', 'แม่อาย', 'พร้าว', 'สันป่าตอง', 'สันกำแพง', 'สันทราย', 'หางดง', 'ฮอด', 'ดอยเต่า', 'อมก๋อย', 'สารภี', 'เวียงแหง', 'ไชยปราการ', 'แม่วาง', 'แม่ออน', 'ดอยหล่อ', 'กัลยาณิวัฒนา'],
    'ชลบุรี': ['เมืองชลบุรี', 'บ้านบึง', 'หนองใหญ่', 'บางละมุง', 'พานทอง', 'พนัสนิคม', 'ศรีราชา', 'เกาะจันทร์', 'สัตหีบ', 'บ่อทอง', 'เกาะสีชัง'],
    'ขอนแก่น': ['เมืองขอนแก่น', 'บ้านฝาง', 'พระยืน', 'หนองเรือ', 'ชุมแพ', 'สีชมพู', 'น้ำพอง', 'อุบลรัตน์', 'กระนวน', 'บ้านไผ่', 'เปือยน้อย', 'พล', 'แวงใหญ่', 'แวงน้อย', 'หนองสองห้อง', 'ภูเวียง', 'มัญจาคีรี', 'ชนบท', 'เขาสวนกวาง', 'ภูผาม่าน', 'ซำสูง', 'โคกโพธิ์ไชย', 'หนองนาคำ', 'บ้านแฮด', 'โนนศิลา', 'เวียงเก่า'],
    'จันทบุรี': ['เมืองจันทบุรี', 'ขลุง', 'เกาะขาม', 'หนองบัว', 'ท่าใหม่', 'สอยดาว', 'มะขาม', 'แหลมสิงห์', 'นายายอาม'],
    'ฉะเชิงเทรา': ['เมืองฉะเชิงเทรา', 'บางคล้า', 'บางปะกง', 'แปลงยาว', 'ท่าตะเกียบ', 'คลองเขื่อน', 'หนองขาม', 'สนามชัยเขต'],
    'ชลบุรี': ['เมืองชลบุรี', 'บ้านบึง', 'หนองใหญ่', 'บางละมุง', 'พานทอง', 'พนัสนิคม', 'ศรีราชา', 'เกาะจันทร์', 'สัตหีบ', 'บ่อทอง', 'เกาะสีชัง'],
    'ชัยนาท': ['เมืองชัยนาท', 'มโนรมย์', 'บรรพตพิสัย', 'สรรคบุรี', 'วัดสิงห์', 'หันคา', 'หนองมะโมง', 'เจ้าพระยา'],
    'ชัยภูมิ': ['เมืองชัยภูมิ', 'บ้านเขว้า', 'ด่านขุนทด', 'ภูเขียว', 'ซับสมอทอด', 'หนองบัวแดง', 'คอนสวรรค์', 'แก้งคร้อ'],
    'ชุมพร': ['เมืองชุมพร', 'ท่าแซะ', 'ปะทิว', 'หลังสวน', 'พะโต๊ะ', 'สวี', 'บางสะพาน', 'ห้วยทราย'],
    'เชียงราย': ['เมืองเชียงราย', 'แม่จัน', 'แม่สาย', 'เชียงของ', 'ดอยหล่อ', 'เวียงเชียงรุ้ง', 'ป่าแดด', 'แม่ฟ้าหลวง'],
    'เชียงใหม่': ['เมืองเชียงใหม่', 'จอมทอง', 'แม่แจ่ม', 'เชียงดาว', 'ดอยสะเก็ด', 'แม่แตง', 'แม่ริม', 'สะเมิง', 'ฝาง', 'แม่อาย', 'พร้าว', 'สันป่าตอง', 'สันกำแพง', 'สันทราย', 'หางดง', 'ฮอด', 'ดอยเต่า', 'อมก๋อย', 'สารภี', 'เวียงแหง', 'ไชยปราการ', 'แม่วาง', 'แม่ออน', 'ดอยหล่อ', 'กัลยาณิวัฒนา'],
    'ตรัง': ['เมืองตรัง', 'กันตัง', 'ย่านตาขาว', 'ปะเหลียน', 'รัษฎา', 'สิเกา', 'ห้วยยอด', 'นาโยง'],
    'ตราด': ['เมืองตราด', 'คลองใหญ่', 'เกาะช้าง', 'เกาะกูด', 'เกาะหมาก', 'บ่อไร่', 'แหลมงอบ'],
    'ตาก': ['เมืองตาก', 'แม่สอด', 'พบพระ', 'อุ้มผาง', 'สามเงา', 'ตากออก', 'แม่ระมาด', 'บ้านตาก'],
    'นครนายก': ['เมืองนครนายก', 'บ้านนา', 'ปากพลี', 'องครักษ์', 'นครหลวง', 'เขาพระ', 'สาริกา'],
    'นครปฐม': ['เมืองนครปฐม', 'สามพราน', 'นครชัยศรี', 'พุทธมณฑล', 'ดอนตูม', 'บ้านแพ้ว', 'กระทุ่มแบน'],
    'นครพนม': ['เมืองนครพนม', 'ท่าอุเทน', 'โพนสวรรค์', 'บ้านแพง', 'ศรีสงคราม', 'นาหว้า', 'นาแก', 'เรณูนคร'],
    'นครราชสีมา': ['เมืองนครราชสีมา', 'ครบุรี', 'เสิงสาง', 'คง', 'บัวใหญ่', 'โนนสูง', 'ปักธงชัย', 'หนองบุญมาก', 'บ้านเหลื่อม', 'เมืองยาง', 'สรรคบุรี', 'เทพารักษ์'],
    'นครศรีธรรมราช': ['เมืองนครศรีธรรมราช', 'ท่าศาลา', 'ปากพนัง', 'พระพรหม', 'ลานสกา', 'ร่อนพิบูลย์', 'ชะอวด', 'สิชล', 'นบพิตำ', 'ขนอม', 'หัวไทร', 'เฉลิมพระเกียรติ'],
    'นครสวรรค์': ['เมืองนครสวรรค์', 'พยุห์', 'ตากฟ้า', 'ตากออก', 'แม่เปิน', 'นครไทย', 'บรรพตพิสัย', 'หนองบัว'],
    'นนทบุรี': ['เมืองนนทบุรี', 'ปากเกร็ด', 'บางกรวย', 'บางใหญ่', 'ไทรน้อย', 'บัวทอง', 'คลองข่อย'],
    'นราธิวาส': ['เมืองนราธิวาส', 'ตากใบ', 'บาเจาะ', 'ระแงะ', 'รือเสาะ', 'สุไหงปาดี', 'สุไหงโก-ลก'],
    'น่าน': ['เมืองน่าน', 'เชียงกลาง', 'นาน้อย', 'นาหมื่น', 'บ่อเกลือ', 'ปัว', 'สันติสุข', 'ท่าวังผา'],
    'บึงกาฬ': ['เมืองบึงกาฬ', 'เซกา', 'ปากคาด', 'บึงโขงหลง', 'โซ่พิสัย', 'สว่างแดนดิน'],
    'บุรีรัมย์': ['เมืองบุรีรัมย์', 'คูเมือง', 'บ้านกรวด', 'นางรอง', 'ประโคนชัย', 'ลำปลายมาศ', 'สตึก', 'เฉลิมพระเกียรติ'],
    'ปทุมธานี': ['เมืองปทุมธานี', 'คลองหลวง', 'ธัญบุรี', 'ลำลูกกา', 'หนองเสือ', 'สามโคก', 'วังน้อย'],
    'ประจวบคีรีขันธ์': ['เมืองประจวบคีรีขันธ์', 'หัวหิน', 'ปราณบุรี', 'บ่อนอก', 'ดอนยายหนู', 'เขาเต่า'],
    'ปราจีนบุรี': ['เมืองปราจีนบุรี', 'ศรีมหาโพธิ', 'บ้านสร้าง', 'กบินทร์บุรี', 'ประจันตคาม', 'นาดี'],
    'ปัตตานี': ['เมืองปัตตานี', 'หนองจิก', 'ทุ่งยางแดง', 'แม่ลาน', 'ปะนาเระ', 'มายอ', 'ยะหา', 'เบตง'],
    'พระนครศรีอยุธยา': ['เมืองพระนครศรีอยุธยา', 'บางปะอิน', 'บางไทร', 'บางบาล', 'พระนครศรีอยุธยา', 'อุทัย', 'ลาดบัวหลวง'],
    'พะเยา': ['เมืองพะเยา', 'เชียงคำ', 'ดอกคำใต้', 'แม่ใจ', 'ปง', 'ร้องกวาง', 'วังเหนือ'],
    'พังงา': ['เมืองพังงา', 'เกาะยาว', 'ตะกั่วป่า', 'คุระบุรี', 'พนม', 'ลำแก่น'],
    'พัทลุง': ['เมืองพัทลุง', 'กงหรา', 'เขาชัยสน', 'ปากพะยูน', 'ศรีบรรพต', 'สุราษฎร์ธานี'],
    'พิจิตร': ['เมืองพิจิตร', 'บึงนาราง', 'โพธิ์ประทับช้าง', 'วังทรายพูน', 'ทับคล้อ', 'สามง่าม'],
    'พิษณุโลก': ['เมืองพิษณุโลก', 'บางระกำ', 'บางกระทุ่ม', 'บึงพระ', 'วังทอง', 'นครไทย', 'ชาติตระการ'],
    'เพชรบุรี': ['เมืองเพชรบุรี', 'ชะอำ', 'หัวหิน', 'ท่ายาง', 'บ้านลาด', 'หนองแก'],
    'เพชรบูรณ์': ['เมืองเพชรบูรณ์', 'หล่มสัก', 'ด่านช้าง', 'เขาค้อ', 'หนองไผ่', 'บึงสามพัน'],
    'แพร่': ['เมืองแพร่', 'ร้องกวาง', 'หนองม่วง', 'สูงเม่น', 'ลับแล', 'เด่นชัย'],
    'ภูเก็ต': ['เมืองภูเก็ต', 'กะทู้', 'ถลาง', 'ป่าตอง', 'ราไวย์', 'วิชิต'],
    'มหาสารคาม': ['เมืองมหาสารคาม', 'แกดำ', 'กุดรัง', 'นาเชือก', 'บรบือ', 'เชียงยืน'],
    'มุกดาหาร': ['เมืองมุกดาหาร', 'ดอนตาล', 'คำชะอี', 'หนองสูง', 'มุกดาหาร', 'นิคมคำสร้อย'],
    'แม่ฮ่องสอน': ['เมืองแม่ฮ่องสอน', 'ปาย', 'แม่สะเรียง', 'แม่ลาน้อย', 'สบเมย', 'เมืองปอน'],
    'ยโสธร': ['เมืองยโสธร', 'กุดชุม', 'ค้อวัง', 'ทรายมูล', 'ป่าติ้ว', 'ยางชุมน้อย'],
    'ยะลา': ['เมืองยะลา', 'เบตง', 'บันนังสตา', 'แม่กลอง', 'ยะหา', 'รามัน'],
    'ร้อยเอ็ด': ['เมืองร้อยเอ็ด', 'จตุรพักตร์', 'ทุ่งเขาหลวง', 'หนองพอก', 'เสลภูมิ', 'โพนทอง'],
    'ระนอง': ['เมืองระนอง', 'กระบุรี', 'ละอุ่น', 'บางริ้น', 'หาดส้มแป้น'],
    'ระยอง': ['เมืองระยอง', 'บ้านฉาง', 'ปลวกแดง', 'พัทยา', 'เขาชีจรรย์'],
    'ราชบุรี': ['เมืองราชบุรี', 'จอมบึง', 'ดำเนินสะดวก', 'ปากท่อ', 'โพธาราม', 'บ้านโป่ง'],
    'ลพบุรี': ['เมืองลพบุรี', 'บ้านหมี่', 'ลำสนธิ', 'ท่าวุ้ง', 'โคกสำโรง', 'พัฒนานิคม'],
    'ลำปาง': ['เมืองลำปาง', 'เขลางค์นคร', 'งาว', 'เสริมงาม', 'แม่ทะ', 'ลำปลายมาศ'],
    'ลำพูน': ['เมืองลำพูน', 'บ้านธิ', 'ป่าซาง', 'ลี้', 'ทาเหนือ', 'ทาตรัง'],
    'เลย': ['เมืองเลย', 'เชียงคาน', 'ด่านซ้าย', 'นาแห้ว', 'ภูหลวง', 'ท่าลี่'],
    'ศรีสะเกษ': ['เมืองศรีสะเกษ', 'กันทรลักษ์', 'ขุขันธ์', 'ปราสาท', 'ราษีไศล', 'วังหิน'],
    'สกลนคร': ['เมืองสกลนคร', 'กุสุมาลย์', 'พรรณานิคม', 'ภูพาน', 'วารินชำราบ', 'เจริญศิลป์'],
    'สงขลา': ['เมืองสงขลา', 'หาดใหญ่', 'คอหงส์', 'บางกล่ำ', 'สิงหนคร', 'นาทวี'],
    'สตูล': ['เมืองสตูล', 'ละงู', 'ควนโดน', 'ท่าแพ', 'สำนักขาม'],
    'สมุทรปราการ': ['เมืองสมุทรปราการ', 'บางพลี', 'พระประแดง', 'ทรงคนอง', 'บางเสาธง'],
    'สมุทรสงคราม': ['เมืองสมุทรสงคราม', 'บางคนที', 'อัมพวา', 'บ้านแหลม'],
    'สมุทรสาคร': ['เมืองสมุทรสาคร', 'บ้านแพ้ว', 'กระทุ่มแบน', 'บางน้ำเปรี้ยว'],
    'สระแก้ว': ['เมืองสระแก้ว', 'อรัญประเทศ', 'คลองหาด', 'เขาฉกรรจ์', 'วังสมบูรณ์'],
    'สระบุรี': ['เมืองสระบุรี', 'แก่งคอย', 'บ้านหมอ', 'หนองแค', 'วิหารแดง'],
    'สิงห์บุรี': ['เมืองสิงห์บุรี', 'ค่ายบางระจัน', 'บางระจัน', 'ท่าช้าง'],
    'สุโขทัย': ['เมืองสุโขทัย', 'คีรีมาศ', 'บ้านด่านลานหอย', 'ศรีสำโรง', 'สวรรคโลก'],
    'สุพรรณบุรี': ['เมืองสุพรรณบุรี', 'เดิมบางนางบวช', 'ด่านช้าง', 'สามชุก', 'อู่ทอง'],
    'สุราษฎร์ธานี': ['เมืองสุราษฎร์ธานี', 'กาญจนดิษฐ์', 'ดอนสัก', 'บ้านตาขุน', 'พุนพิน', 'เกาะสมุย', 'เกาะพะงัน'],
    'สุรินทร์': ['เมืองสุรินทร์', 'ชุมพลบุรี', 'คูเมือง', 'ปราสาท', 'รัตนบุรี', 'ลำดวน'],
    'หนองคาย': ['เมืองหนองคาย', 'ท่าบ่อ', 'โพนพิสัย', 'สระใคร', 'หนองกุง'],
    'หนองบัวลำภู': ['เมืองหนองบัวลำภู', 'โนนสัง', 'หนองบัว', 'บ้านค่าย'],
    'อ่างทอง': ['เมืองอ่างทอง', 'โพธิ์ทอง', 'วิเศษชัยชาญ', 'ป่าโมก', 'สามโก้'],
    'อำนาจเจริญ': ['เมืองอำนาจเจริญ', 'ชานุมาน', 'ปทุมราชวงศา', 'พนา', 'ลืออำนาจ'],
    'อุดรธานี': ['เมืองอุดรธานี', 'กุดั่น', 'บ้านดุง', 'หนองหาน', 'โนนสะอาด'],
    'อุตรดิตถ์': ['เมืองอุตรดิตถ์', 'ตรอน', 'บ้านโคก', 'น้ำปาด', 'พิชัย'],
    'อุทัยธานี': ['เมืองอุทัยธานี', 'บ้านไร่', 'หนองฉาง', 'สว่างอารมณ์', 'อุทัยเก่า'],
    'อุบลราชธานี': ['เมืองอุบลราชธานี', 'วารินชำราบ', 'พิบูลมังสาหาร', 'ตาลสุม', 'เขมราฐ']
};

function updateAmphurOptions(type) {
    const provinceSelect = document.getElementById(type + '-province');
    const amphurSelect = document.getElementById(type + '-amphur');
    const province = provinceSelect.value;
    amphurSelect.innerHTML = '<option value="">เลือกอำเภอ</option>';
    if (provinceToAmphur[province]) {
        provinceToAmphur[province].forEach(amphur => {
            const option = document.createElement('option');
            option.value = amphur;
            option.textContent = amphur;
            amphurSelect.appendChild(option);
        });
    }
}