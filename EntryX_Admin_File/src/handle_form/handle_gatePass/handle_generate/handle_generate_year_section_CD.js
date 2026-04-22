document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("section");
    const datalist = document.getElementById("sectionList");

    const yearLevels = ["1", "2", "3", "4"];
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const allSections = [];

    // GENERATE DATA
    yearLevels.forEach(year => {
        for (let i = 0; i < letters.length; i++) {
        allSections.push(`${year}-${letters[i]}`);
        }
    });

    // FILTER FUNCTION WITH CONDITION
    input.addEventListener("input", function () {
        const value = this.value.trim().toLowerCase();

        datalist.innerHTML = "";

        // CONDITION: only show suggestions if user types something
        if (value.length < 1) {
        return; // stop here
        }

        const filtered = allSections.filter(item =>
        item.toLowerCase().includes(value)
        );

        filtered.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        datalist.appendChild(option);
        });
    });

    // YEAR LEVEL GENERATOR
    const yearLevelDatalist = document.getElementById("yearLevelList");

    const yearLevelOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

    yearLevelOptions.forEach(level => {  
        const option = document.createElement("option");
        option.value = level;
        yearLevelDatalist.appendChild(option);
    });



    // DEPARTMENT GENERATOR
    const departmentList = document.getElementById("departmentList");

    const departments = [
    "College of Architecture",
    "College of Arts and Sciences",
    "College of Business Administration and Accountancy",
    "College of Criminal Justice Education",
    "College of Communication and Information Technology",
    "College of Engineering",
    "College of Fine Arts and Design",
    "College of Health Sciences",
    "College of Hospitality and Tourism Management",
    "College of Law",
    "College of Medicine",
    "College of Nursing",
    "College of Social Work",
    "College of Public Administration",
    "College of Teacher Education",
    "College of Technology"
    ];

    // LIMIT DISPLAY (acts like max-height behavior)
    const MAX_SHOW = 8;

    function renderDepartments(filter = "") {
    departmentList.innerHTML = "";

    const filtered = departments.filter(d =>
        d.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.slice(0, MAX_SHOW).forEach(dept => {
        const option = document.createElement("option");
        option.value = dept;
        departmentList.appendChild(option);
    });
    }

    // initial load
    renderDepartments();

    // live search
    const inputDepartment = document.getElementById("department");
    inputDepartment.addEventListener("input", function () {
    renderDepartments(this.value);
    });
});
