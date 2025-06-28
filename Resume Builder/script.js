let currentStep = 1;
const totalSteps = 8;

document.addEventListener("DOMContentLoaded", () => {
      updateProgress();
      document.getElementById("summary-text").addEventListener("input", updateWordCount);
});

function updateWordCount() {
      const summaryText = document.getElementById("summary-text").value;
      const wordCount = summaryText.trim().split(/\s+/).filter(Boolean).length;
      document.getElementById("summary-count").textContent = `${wordCount}`;
      document.getElementById("summary-text").setCustomValidity(
            wordCount < 50 || wordCount > 500 ? "Summary must be between 50 and 500 words." : ""
      );
}

function toggleExperienceSection() {
      const isFresher = document.querySelector('input[name="experience-type"]:checked').value === "fresher";
      document.querySelectorAll(".job-title, .company-name").forEach(input => {
            input.required = !isFresher;
      });
}

function nextStep() {
      if (!validateCurrentStep()) return;

      if (currentStep < totalSteps) {
            document.querySelector(`#basic-info[data-step="${currentStep}"], #summary[data-step="${currentStep}"], #experience[data-step="${currentStep}"], #education[data-step="${currentStep}"], #skills[data-step="${currentStep}"], #analysis[data-step="${currentStep}"], #comparison[data-step="${currentStep}"], #generate-resume[data-step="${currentStep}"]`).classList.remove("active");
            currentStep++;
            document.querySelector(`.form-section[data-step="${currentStep}"]`).classList.add("active");
            updateProgress();
      }
}

function previousStep() {
      if (currentStep > 1) {
            document.querySelector(`.form-section[data-step="${currentStep}"]`).classList.remove("active");
            currentStep--;
            document.querySelector(`.form-section[data-step="${currentStep}"]`).classList.add("active");
            updateProgress();
      }
}

function updateProgress() {
      document.getElementById("progress-bar").style.width = `${(currentStep / totalSteps) * 100}%`;
      document.getElementById("prev-btn").disabled = currentStep === 1;
      document.getElementById("generate-btn").style.display = currentStep === totalSteps ? "block" : "none";
      document.getElementById("next-btn").style.display = currentStep === totalSteps ? "none" : "block";
}
function checkResumeWeight() {
      const summaryText = document.getElementById("summary-text").value.trim();
      const resumeLength = summaryText.split(/\s+/).filter(Boolean).length;

      let score = 0;
      let message = "";

      if (resumeLength >= 50 && resumeLength <= 500) {
            score += 50;
      } else {
            message += "⚠️ Summary length should be between 50 and 500 words.\n";
      }

      const skillKeywords = [
            "javascript", "react", "css", "html", "api", "node", "python", "agile",
            "git", "communication", "teamwork", "problem-solving", "design"
      ];
      const resumeText = summaryText.toLowerCase();
      const matchedKeywords = skillKeywords.filter(skill => resumeText.includes(skill));
      score += matchedKeywords.length * 3;

      const rating =
            score >= 80 ? "🔥 Excellent" :
                  score >= 60 ? "✅ Good" :
                        score >= 40 ? "⚠️ Fair" : "❌ Weak";

      const output = `
    <strong>Resume Strength Score:</strong> ${score}/100<br/>
    <strong>Rating:</strong> ${rating}<br/>
    <strong>Matched Keywords:</strong> ${matchedKeywords.join(", ") || "None"}<br/>
    <strong>Tip:</strong> Use strong, action-oriented keywords and tailor your resume to the job you're applying for.
  `;

      document.getElementById("resume-score-output").innerHTML = output;
}

function checkJobAlignment() {
      const jobDesc = document.getElementById("job-desc").value.toLowerCase();
      const resumeSummary = document.getElementById("summary-text").value.toLowerCase();

      if (!jobDesc || !resumeSummary) {
            alert("Please make sure both the job description and resume summary are filled.");
            return;
      }

      const extractKeywords = text => {
            return [...new Set(text.match(/\b[a-zA-Z]{4,}\b/g))];
      };

      const jobKeywords = extractKeywords(jobDesc);
      const resumeKeywords = extractKeywords(resumeSummary);

      const commonKeywords = jobKeywords.filter(word => resumeKeywords.includes(word));
      const matchPercentage = ((commonKeywords.length / jobKeywords.length) * 100).toFixed(2);

      const message = `
    <strong>Job Keywords:</strong> ${jobKeywords.join(", ")}<br/>
    <strong>Resume Keywords:</strong> ${resumeKeywords.join(", ")}<br/>
    <strong>Matched Keywords (${commonKeywords.length}):</strong> ${commonKeywords.join(", ") || "None"}<br/>
    <strong>Match Percentage:</strong> ${matchPercentage}%<br/>
    <strong>Suggestion:</strong> ${matchPercentage > 70
                  ? "Your resume aligns well with the job description."
                  : "Consider adding more job-specific keywords to your resume summary."
            }
  `;

      document.getElementById("job-alignment-output").innerHTML = message;
}

function validateCurrentStep() {
      const section = document.querySelector(`.form-section[data-step="${currentStep}"]`);
      const inputs = section.querySelectorAll("input, textarea");

      for (let input of inputs) {
            if (!input.checkValidity()) {
                  input.reportValidity();
                  return false;
            }
      }

      if (currentStep === 2) {
            const wordCount = document.getElementById("summary-text").value.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount < 50 || wordCount > 500) {
                  alert("Summary must be between 50 and 500 words.");
                  return false;
            }
      }

      return true;
}

function generateResume() {
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const linkedin = document.getElementById("linkedin").value;
      const location = document.getElementById("location").value;
      const portfolio = document.getElementById("portfolio").value;
      const summary = document.getElementById("summary-text").value;

      // Work Experience
      let experienceHTML = "";
      document.querySelectorAll(".experience-item").forEach((item, index) => {
            const jobTitle = item.querySelector(".job-title")?.value || "";
            const companyName = item.querySelector(".company-name")?.value || "";
            const startDate = item.querySelector(".start-date")?.value || "";
            const endDate = item.querySelector(".end-date")?.value || "";
            const isCurrent = item.querySelector(".current-job")?.checked;
            const description = item.querySelector(".job-description")?.value || "";

            if (jobTitle || companyName) {
                  experienceHTML += `<h3>${jobTitle} at ${companyName}</h3>
        <p><strong>${startDate}</strong> – <strong>${isCurrent ? "Present" : endDate}</strong></p>
        <p>${description.replace(/\n/g, "<br>")}</p>`;
            }
      });

      // Education
      let educationHTML = "";
      document.querySelectorAll(".education-item").forEach(item => {
            const degree = item.querySelector(".degree")?.value || "";
            const field = item.querySelector(".field-of-study")?.value || "";
            const institution = item.querySelector(".institution")?.value || "";
            const year = item.querySelector(".graduation-year")?.value || "";
            const gpa = item.querySelector(".gpa")?.value || "";

            educationHTML += `<h3>${degree} in ${field}</h3>
      <p><strong>${institution}</strong>, ${year} ${gpa ? `(GPA: ${gpa})` : ""}</p>`;
      });

      // Skills
      const technicalSkills = document.getElementById("technical-skills").value;
      const softSkills = document.getElementById("soft-skills").value;
      const languages = document.getElementById("languages").value;
      const certifications = document.getElementById("certifications").value;

      // Final Resume HTML
      const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Resume</title></head>
    <body style="font-family:Arial; line-height:1.5;">
      <h1>${name}</h1>
      <p><strong>Email:</strong> ${email}<br/>
         <strong>Phone:</strong> ${phone}<br/>
         <strong>LinkedIn:</strong> ${linkedin}<br/>
         ${location ? `<strong>Location:</strong> ${location}<br/>` : ""}
         ${portfolio ? `<strong>Portfolio:</strong> ${portfolio}<br/>` : ""}
      </p>

      <h2>Professional Summary</h2>
      <p>${summary.replace(/\n/g, "<br>")}</p>

      ${experienceHTML ? `<h2>Work Experience</h2>${experienceHTML}` : ""}
      ${educationHTML ? `<h2>Education</h2>${educationHTML}` : ""}

      <h2>Skills & Technologies</h2>
      ${technicalSkills ? `<p><strong>Technical:</strong> ${technicalSkills}</p>` : ""}
      ${softSkills ? `<p><strong>Soft Skills:</strong> ${softSkills}</p>` : ""}
      ${languages ? `<p><strong>Languages:</strong> ${languages}</p>` : ""}
      ${certifications ? `<p><strong>Certifications:</strong> ${certifications}</p>` : ""}
    </body>
    </html>`;

      // Create and download Word file
      const blob = new Blob(['\ufeff', content], {
            type: 'application/msword'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_Resume.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
}


function compareResumes() {
      const resumeA = document.getElementById("resume-a").value.toLowerCase();
      const resumeB = document.getElementById("resume-b").value.toLowerCase();

      const extractWords = text => new Set(text.match(/\b[a-z]{4,}\b/g) || []);
      const wordArray = text => (text.match(/\b[a-z]{4,}\b/g) || []);

      const wordsA = extractWords(resumeA);
      const wordsB = extractWords(resumeB);

      const common = [...wordsA].filter(w => wordsB.has(w));
      const uniqueA = [...wordsA].filter(w => !wordsB.has(w));
      const uniqueB = [...wordsB].filter(w => !wordsA.has(w));

      const allUnique = new Set([...wordsA, ...wordsB]);
      const matchScore = ((common.length / allUnique.size) * 100).toFixed(1);

      // Strength score based on keyword richness
      const scoreKeywords = [
            "javascript", "react", "node", "express", "python", "api", "rest", "html", "css", "agile", "team", "aws",
            "git", "docker", "ci", "cd", "testing", "performance", "architecture", "frontend", "backend", "cloud"
      ];

      const keywordScore = (resumeText) => {
            let words = wordArray(resumeText);
            return scoreKeywords.reduce((acc, keyword) => acc + words.filter(w => w === keyword).length * 3, 0);
      };

      const scoreA = keywordScore(resumeA);
      const scoreB = keywordScore(resumeB);

      let verdict = "Both resumes are equally strong.";
      if (scoreA > scoreB) verdict = "🏆 Resume A is stronger overall.";
      else if (scoreB > scoreA) verdict = "🏆 Resume B is stronger overall.";

      document.getElementById("comparison-output").innerHTML = `
    <div class="score-bar-container">
      <div class="score-label">Similarity Score: ${matchScore}%</div>
      <div class="score-bar"><div class="score-bar-fill" style="width: ${matchScore}%;"></div></div>
    </div>

    <div style="margin: 20px 0;">
      <p><strong>Resume A Strength Score:</strong> ${scoreA}/100</p>
      <p><strong>Resume B Strength Score:</strong> ${scoreB}/100</p>
      <p style="font-weight: bold; color: #2c3e50;">${verdict}</p>
    </div>

    <p><strong style="color: green;">Common Keywords (${common.length}):</strong> ${common.join(", ")}</p>
    <p><strong style="color: red;">Only in Resume A (${uniqueA.length}):</strong> ${uniqueA.join(", ")}</p>
    <p><strong style="color: blue;">Only in Resume B (${uniqueB.length}):</strong> ${uniqueB.join(", ")}</p>
  `;
}


// External: include this in HTML for PDF generation
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
