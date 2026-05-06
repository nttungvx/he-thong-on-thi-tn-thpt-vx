// Hàm trộn mảng (Thuật toán Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function processAndPackage() {
    const fileInput = document.getElementById('excelFile');
    const examTitle = document.getElementById('examTitle').value || 'Đề Thi Tốt Nghiệp';

    if (!fileInput.files.length) {
        alert("Vui lòng chọn file Excel!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        
        // Đọc sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Chuyển Excel sang JSON
        let questions = XLSX.utils.sheet_to_json(worksheet);
        
        // Xáo trộn thứ tự câu hỏi
        questions = shuffleArray(questions);

        // Tạo file HTML đóng gói
        const finalHTML = createExamTemplate(examTitle, questions);
        downloadHTML(examTitle, finalHTML);
    };

    reader.readAsArrayBuffer(file);
}

function createExamTemplate(title, questions) {
    const jsonData = JSON.stringify(questions);

    // Template này sẽ là file mà học sinh nhận được
    // Đã tích hợp MathJax để hiển thị công thức Toán học
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"><\/script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; line-height: 1.6; }
        .question-box { background: #f9f9f9; padding: 15px; margin-bottom: 20px; border-left: 4px solid #3498db; }
        .options label { display: block; margin: 5px 0; cursor: pointer; }
    </style>
</head>
<body>
    <h1 style="text-align: center; color: #2c3e50;">${title}</h1>
    <div id="exam-container"></div>

    <script>
        const examData = ${jsonData};
        const container = document.getElementById('exam-container');

        examData.forEach((q, index) => {
            let html = '<div class="question-box">';
            html += '<p><strong>Câu ' + (index + 1) + ':</strong> ' + (q.CauHoi || '') + '</p>';
            html += '<div class="options">';
            ['A', 'B', 'C', 'D'].forEach(opt => {
                const optContent = q['DapAn' + opt];
                if(optContent) {
                    html += '<label><input type="radio" name="q'+index+'" value="'+opt+'"> <strong>'+opt+'.</strong> ' + optContent + '</label>';
                }
            });
            html += '</div></div>';
            container.innerHTML += html;
        });
    <\/script>
</body>
</html>`;
}

function downloadHTML(filename, content) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename + ".html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}