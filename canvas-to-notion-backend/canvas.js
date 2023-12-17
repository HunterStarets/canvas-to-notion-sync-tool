const axios = require("axios");
const moment = require("moment-timezone");

async function getAssignments(API_KEY, API_URL, courseId, timezone) {
  const assignmentsPerPage = 100;

  let formattedAssignmentsArray = [];

  const response = await axios
    .get(
      `${API_URL}/api/v1/courses/${courseId}/assignments?per_page=${assignmentsPerPage}`,
      {
        headers: { Authorization: "Bearer " + API_KEY },
      }
    )
    .then((response) => {
      let rawAssignments = response.data;
      //console.log(rawAssignments);
      for (let rawAssignment of rawAssignments) {
        let unlockAt = !rawAssignment.unlock_at
          ? rawAssignment.unlock_at
          : convertUtcToTimezone(rawAssignment.unlock_at, timezone);
        let dueAt = !rawAssignment.due_at
          ? rawAssignment.due_at
          : convertUtcToTimezone(rawAssignment.due_at, timezone);

        let formattedAssignment = {
          //add new fields here
          name: rawAssignment.name,
          assignmentId: rawAssignment.id,
          date: {
            unlockAt: unlockAt,
            dueAt: dueAt,
          },
          assignmentType: rawAssignment.is_quiz_assignment
            ? "Test/Quiz"
            : "Assignment",
          url: rawAssignment.html_url,
        };
        formattedAssignmentsArray.push(formattedAssignment);
      }
    });
  return formattedAssignmentsArray;
}

function convertUtcToTimezone(dateTimeString, timezone) {
  let date = moment.utc(dateTimeString);
  let convertedDate = date.tz(timezone).format();

  return convertedDate;
}

module.exports = {
  getAssignments,
  convertUtcToTimezone,
};

/*
function getAllAssignments /*list of courseids() {
  /* courseIds 
  //output assignments list
  //for each item in courseids
  //courseAssignmentList = getAssignments(courseid)
  //list.addAll(courseAssignmentList))
  //return output assignments list
}
/*
//takes in a json string from canvas
function formatAssignments(jsonAssingment) {
  /*
  let objectAssignment {
    title,
    dueDate,
  }
  return objectAssignment;
  
}

function parseAssignments() {}

//returns list of assignment from course
/*
function getAssignments(courseId) {
  // Set up the Canvas API endpoint and your API key
  const API_URL =
    "https://cors-anywhere.herokuapp.com/https://uncc.instructure.com/api/v1";
  //const API_URL = "https://uncc.instructure.com/api/v1";
  const API_KEY = process.env.CANVAS_API_KEY;

  // Get the assignments for the course using the Canvas API
  fetch(`${API_URL}/courses/${courseId}/assignments?per_page=100`, {
    //https://uncc.instructure.com:443/api/v1/courses/188090/assignments
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      //Origin: "http://localhost:3000",
      //mode: "no-cors",
    },
  })
    .then((response) => response.json())
    .then((assignments) => {
      // Do something with the assignments data
      //console.log(assignments);
      return assignments;
    })
    .catch((error) => console.error(error));
}
*/

/*
const API_KEY =
  "7301~kT6q0x1iBLQ0oDo0c3nsJHHWbDawgLN76MK0Pj2GckJflPBOCnk2aSBX0b8LY7HI";
const url =
  "https://cryptic-thicket-16048-a212f5861091.herokuapp.com/https://uncc.instructure.com:443/api/v1/courses/188090/assignments";

fetch(url, {
  method: "GET",
  Authorization: "Bearer " + API_KEY,
  header: {
    "Content-Type": "application/json",
  },
});



/*
    Important variables 
        "due_at", 
        "due_date_required", 
        "has_submitted_submissions", 
        "html_url", 
        "lock_at"
        "lock_info.lock_at", 
        "locked_for_user", 
        "name", 
        "omit_from_final_grade", 
        "submission_types",
        "unlock_at"
    
        const courseIds = ["189387", "189166", "190605", "187783", "190687", "188090"];
        const courseNames = [
          "ITIS-3135",
          "ITIS-3310",
          "ITSC-2600",
          "KNES-1231",
          "LBST-2301",
          "MATH-2164",
        ];
        */
