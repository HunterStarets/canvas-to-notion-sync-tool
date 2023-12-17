const notion = require("./notion");
const canvas = require("./canvas");

async function createNewPages(
  NOTION_API_KEY,
  CANVAS_API_KEY,
  CANVAS_API_URL,
  canvasCourseIdList,
  assignmentsPageDetails,
  coursePageDetails,
  timezone
) {
  //let courseIds = await notion.getCourseIds(); //[187783];
  //console.log(courseIds);

  let courseIdClassPageIdMap = await notion.getCourseIdClassPageIdMap();
  let courseIdCourseEmojiMap = await notion.getCourseIdCourseEmojiMap();
  //console.log(courseIdAssignmentsMap);

  //populate courseIdAssignmentsMap
  let courseIdAssignmentsMap = new Map();
  for (let courseId of courseIds) {
    let assignments = await canvas.getAssignments(courseId);
    courseIdAssignmentsMap.set(courseId, assignments);
  }

  //populate additional assignments fields using courseId maps
  for (let courseId of courseIds) {
    let assignments = courseIdAssignmentsMap.get(courseId);
    for (let assignment of assignments) {
      assignment.classPageId = courseIdClassPageIdMap.get(courseId);
      assignment.emoji = courseIdCourseEmojiMap.get(courseId);
    }
  }

  let existingAssignmentIds = await notion.getAssignmentIds();

  for (courseId of courseIds) {
    let assignments = courseIdAssignmentsMap.get(courseId);
    let parsedAssignments = parseAssignments(
      assignments,
      existingAssignmentIds
    );
    //console.log(parsedAssignments);
    for (let assignment of parsedAssignments) {
      //await notion.createPage(assignment);
    }
  }
  //console.log(courseIdAssignmentsMap);
  return courseIdAssignmentsMap;
}

function parseAssignments(canvasAssignments, existingAssignmentIds) {
  let parsedAssignmentArray = [];
  for (let canvasAssignment of canvasAssignments) {
    if (!existingAssignmentIds.includes(canvasAssignment.assignmentId)) {
      parsedAssignmentArray.push(canvasAssignment);
    }
  }
  return parsedAssignmentArray;
}

module.exports = {
  createNewPages,
};
