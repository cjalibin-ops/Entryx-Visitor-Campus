/**
 * This script handles the generation of input options for the "Person to Visit" and "Purpose" fields in the visitor registration form. It dynamically populates the datalist options based on predefined categories and allows for filtering as the user types. The script ensures that only a limited number of options are displayed at a time for better usability.
 * Author: [Your Name]
 * Date: [Date]
 * 
 */

const personList = document.getElementById("personList");

const groupedPersons = {
  "Administration": [
    "Admin Office",
    "Registrar's Office",
    "Admissions Office",
    "Cashier",
    "Guidance Office",
    "Human Resources",
    "IT Department"
  ],
  "Faculty / Staff": [
    "Dr. Smith (Dean)",
    "Prof. Johnson",
    "Ms. Davis (Accounting)",
    "Mr. Garcia (Instructor)",
    "Ms. Santos (Registrar Staff)",
    "Mr. Cruz (Security Head)",
    "Library Staff"
  ],
  "Others": [
    "Clinic / Nurse",
    "Maintenance Office",
    "Security Office",
    "Student Affairs Office",
    "Others"
  ]
};

const MAX_SHOW_PERSON = 8;

// PERSON TO VISIT GENERATOR
function renderPersons(filter = "") {
  personList.innerHTML = "";
  let count = 0;

  Object.keys(groupedPersons).forEach(category => {
    const items = groupedPersons[category].filter(p =>
      p.toLowerCase().includes(filter.toLowerCase())
    );

    if (items.length > 0 && count < MAX_SHOW_PERSON) {
      const labelOption = document.createElement("option");
      labelOption.value = `--- ${category} ---`;
      personList.appendChild(labelOption);

      items.forEach(item => {
        if (count < MAX_SHOW_PERSON) {
          const option = document.createElement("option");
          option.value = item;
          personList.appendChild(option);
          count++;
        }
      });
    }
  });
}

// initial load
renderPersons();

// Event listener for person input
const inputPerson = document.getElementById("personToVisit");
inputPerson.addEventListener("input", function () {
  if (this.value.startsWith("---")) {
    this.value = "";
    return;
  }
  renderPersons(this.value);
});


// PURPOSE GENERATOR
const purposeList = document.getElementById("purposeList");

const purposes = [
  "General Inquiry",
  "Document Request",
  "Document Pickup",
  "Enrollment / Registration",
  "Payment / Cashier",
  "Official Business",
  "Meeting / Appointment",
  "Interview",
  "Submission of Requirements",
  "Follow-up Request",
  "Technical Support (IT)",
  "Library Use",
  "Medical / Clinic Visit",
  "Personal Matter",
  "Others"
];

const MAX_SHOW_PURPOSE = 8;

function renderPurposes(filter = "") {
  purposeList.innerHTML = "";

  const filtered = purposes.filter(p =>
    p.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.slice(0, MAX_SHOW_PURPOSE).forEach(purpose => {
    const option = document.createElement("option");
    option.value = purpose;
    purposeList.appendChild(option);
  });
}

// initial load
renderPurposes();
// Event listener for purpose input
const inputPurpose = document.getElementById("purpose");
inputPurpose.addEventListener("input", function () {
  renderPurposes(this.value);
});