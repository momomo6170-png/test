



// جلب عناصر واجهة المستخدم
const searchForm = document.getElementById('searchForm');
const sittingNumberInput = document.getElementById('sittingNumber');
const errorMessage = document.getElementById('errorMessage');
const resultSection = document.getElementById('resultSection');

const studentName = document.getElementById('studentName');
const studentGrade = document.getElementById('studentGrade');
const certSittingNumber = document.getElementById('certSittingNumber');
const subjectsTableBody = document.getElementById('subjectsTableBody');
const totalScore = document.getElementById('totalScore');
const percentageText = document.getElementById('percentage');
const currentDateSpan = document.getElementById('currentDate');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// 1. الاستماع لحدث الاستعلام (البحث)
searchForm.addEventListener('submit', function(e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    
    errorMessage.classList.add('hidden');
    resultSection.classList.add('hidden');
    
    const userNumber = sittingNumberInput.value.trim();
    
    if(!userNumber) {
        showError("من فضلك أدخل رقم الجلوس أولاً.");
        return;
    }

    // جلب الطلاب من ملف الـ JSON الخارجي تلقائياً
    fetch('students.json')
        .then(response => {
            if (!response.ok) throw new Error('خطأ في تحميل ملف البيانات');
            return response.json();
        })
        .then(studentsArray => {
            // البحث عن الطالب المطابق لرقم الجلوس
            const student = studentsArray.find(s => s.id === userNumber);
            
            if (student) {
                showStudentResult(student);
            } else {
                showError("رقم الجلوس غير موجود! تأكد من الرقم (أو جرب الأرقام المتاحة في الملف).");
            }
        })
        .catch(err => {
            showError("حدث خطأ في النظام؛ يرجى التأكد من تشغيل المشروع عبر سيرفر محلي (Live Server).");
        });
});

// 2. دالة معالجة وعرض البيانات بالتفصيل في الجدول
function showStudentResult(student) {
    studentName.innerText = student.name;
    studentGrade.innerText = student.grade;
    certSittingNumber.innerText = student.id;
    currentDateSpan.innerText = new Date().toLocaleDateString('ar-EG');
    
    // تجميع المواد والدرجات في مصفوفة مريحة للـ Loop
    const subjects = [
        { name: "اللغة العربية", score: student.arabic, max: 100 },
        { name: "اللغة الإنجليزية", score: student.english, max: 100 },
        { name: "الرياضيات", score: student.math, max: 100 },
        { name: "العلوم", score: student.science, max: 100 },
        { name: "التاريخ", score: student.history, max: 100 },
        { name: "الفلسفه والمنطق", score: student.logic, max: 100 }
    ];
    
    subjectsTableBody.innerHTML = ""; // تفريغ الصفوف القديمة
    
    let totalScoreCounter = 0;
    let totalMaxCounter = 0;
    
    // بناء الجدول وحساب التقديرات ديناميكياً
    subjects.forEach(sub => {
        totalScoreCounter += sub.score;
        totalMaxCounter += sub.max;
        
        const percent = (sub.score / sub.max) * 100;
        let gradeText = "ملحق", gradeClass = "fail";
        
        if (percent >= 85) { gradeText = "ممتاز"; gradeClass = "excellent"; }
        else if (percent >= 75) { gradeText = "جيد جداً"; gradeClass = "very-good"; }
        else if (percent >= 50) { gradeText = "مقبول"; gradeClass = "good"; }
        
        const row = `
            <tr>
                <td style="text-align: right; font-weight: 600;">${sub.name}</td>
                <td>${sub.max}</td>
                <td>${sub.score}</td>
                <td class="${gradeClass}">${gradeText}</td>
            </tr>
        `;
        subjectsTableBody.innerHTML += row;
    });
    
    // تحديث الإجمالي والنسبة المئوية العامة
    totalScore.innerText = `${totalScoreCounter} / ${totalMaxCounter}`;
    const finalPercentage = ((totalScoreCounter / totalMaxCounter) * 100).toFixed(2);
    percentageText.innerText = `${finalPercentage}%`;
    
    // عرض الشهادة كاملة للمستخدم
    resultSection.classList.remove('hidden');
}

function showError(msg) {
    errorMessage.innerText = msg;
    errorMessage.classList.remove('hidden');
}

// 3. تشغيل ميزة تحميل الـ PDF
downloadPdfBtn.addEventListener('click', function() {
    const element = document.getElementById('certificate');
    const opt = {
        margin:       10,
        filename:     `نتيجة_الطالب_${certSittingNumber.innerText}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
});