const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function getDatabase() {
  const response = await notion.databases.retrieve({
    database_id: process.env.NOTION_ASSIGNMENTS_DATABASE_ID,
  });
  console.log(response);
}

async function getAssignmentIds() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ASSIGNMENTS_DATABASE_ID,
  });

  let assignmentIds = [];
  let assignments = response.results;

  for (let assignment of assignments) {
    let assignmentId =
      assignment.properties[process.env.NOTION_ASSIGNMENTS_ASSIGNMENT_ID]
        .number;
    assignmentIds.push(assignmentId);
  }
  return assignmentIds;
}

async function getCourseIdCourseEmojiMap() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_CLASSES_DATABASE_ID,
  });

  let courseIdCourseEmojiMap = new Map();
  let courses = response.results;
  //console.log(courses);

  for (let course of courses) {
    let courseId =
      course.properties[process.env.NOTION_CLASSES_COURSE_ID].number;
    let courseEmoji = course.properties["Emoji"].rich_text[0].plain_text;
    if (!(courseId == null)) {
      courseIdCourseEmojiMap.set(courseId, courseEmoji);
    }
  }
  return courseIdCourseEmojiMap;
}

async function createPage(API_KEY, assignmentsPageDetails, assignment) {
  notion = new Client({ auth: API_KEY });
  const properties = {};

  //Name Assignment Page
  properties[title] = {
    title: [
      {
        type: "text",
        text: {
          content: assignment.name,
        },
      },
    ],
  };

  //assignmentsPageDetails.notionAssignmentsAssignmentIdFieldName should never be null
  properties[assignmentsPageDetails.notionAssignmentsAssignmentIdFieldName] = {
    number: assignment.assignmentId,
  };

  // If date parameter is provided, set the date properties

  if (
    assignment.date.dueAt &&
    assignmentsPageDetails.notionAssignmentsDateFieldName
  ) {
    let unlockAt = assignment.date.unlockAt;
    let dueAt = assignment.date.dueAt;

    properties[process.env.NOTION_ASSIGNMENTS_DATE] = {
      date: {
        start: unlockAt ? unlockAt : dueAt,
        end: unlockAt ? dueAt : null,
      },
    };
  }

  //If notionAssignmentsCourseFieldName is populated then set
  if (assignmentsPageDetails.notionAssignmentsCourseFieldName) {
    properties[assignmentsPageDetails.notionAssignmentsCourseFieldName] = {
      relation: [
        {
          id: assignment.classPageId,
        },
      ],
      has_more: true,
    };
  }

  if (assignmentsPageDetails.notionAssignmentsAssignmentTypeFieldName)
    properties[
      assignmentsPageDetails.notionAssignmentsAssignmentTypeFieldName
    ] = {
      select: {
        name: assignment.assignmentType,
      },
    };

  properties[assignmentsPageDetails.notionAssignmentsUrlFieldName] = {
    url: assignment.url,
  };

  icon = {};
  if (assignment.emoji) {
    icon.type = "emoji";
    icon.emoji = assignment.emoji;
  }

  await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_ASSIGNMENTS_DATABASE_ID,
    },
    icon,
    properties,
  });
}

async function getCourseIds() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_CLASSES_DATABASE_ID,
  });

  let courseIds = [];
  let courses = response.results;

  for (let course of courses) {
    let courseId =
      course.properties[process.env.NOTION_CLASSES_COURSE_ID].number;
    if (courseId != null) {
      courseIds.push(courseId);
    }
  }
  return courseIds;
}

async function getCourseIdClassPageIdMap() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_CLASSES_DATABASE_ID,
  });

  let courseIdCoursePageIdMap = new Map();
  let courses = response.results;
  //console.log(courses);

  for (let course of courses) {
    let courseId =
      course.properties[process.env.NOTION_CLASSES_COURSE_ID].number;
    let coursePageId = course.id;
    if (!(courseId == null)) {
      courseIdCoursePageIdMap.set(courseId, coursePageId);
    }
  }
  return courseIdCoursePageIdMap;
}

async function getRelatedCourses() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ASSIGNMENTS_DATABASE_ID,
  });

  let relatedCourses = [];
  let assignments = response.results;

  for (let assignment of assignments) {
    let relatedCourse = assignment.properties["Class?"].relation[0];
    if (!(relatedCourse == undefined)) {
      relatedCourses.push(relatedCourse);
    }
  }
  return relatedCourses;
}

module.exports = {
  createPage,
  getAssignmentIds,
  getDatabase,
  getCourseIds,
  getRelatedCourses,
  getCourseIdClassPageIdMap,
  getCourseIdCourseEmojiMap,
};
