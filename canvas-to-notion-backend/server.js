require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createNewPages } = require("./controller");
//const validate = require("./middleware/validateFields");

const notion = require("./notion");
const canvas = require("./canvas");

const app = express();
const port = process.env.PORT || 5000;
const defaultTimezone = "America/New_York";

app.use(cors());

async function createCanvasWebhookSubscription(userId, courseId) {
  // Endpoint to create a webhook subscription in Canvas
  const canvasApiUrl = 'https://uncc.instructure.com/api/v1/webhooks_subscriptions';

  // Subscription details
  const subscriptionDetails = {
    'subscription[ContextId]': courseId, // ID of the course
    'subscription[ContextType]': 'course', // Context type
    'subscription[EventTypes]': ['assignment_updated'], // Events you want to subscribe to
    'subscription[Format]': 'live-event',
    'subscription[TransportMetadata]': { 'Url': 'http://yourserver.com/canvas-webhook' }, // URL of your webhook endpoint
    'subscription[TransportType]': 'https',
  };

  // Include any necessary headers, such as authentication tokens
  const headers = {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE',
  };

  try {
    const response = await axios.post(canvasApiUrl, subscriptionDetails, { headers });
    console.log('Subscription created:', response.data);
  } catch (error) {
    console.error('Error creating subscription:', error);
  }

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/get-assignments", async (req, res) => {
  //DECLARE MOCK REQ FOR TESTING PURPOSES
  let mockReq = {
    query: {
      "canvas-api-key": process.env.CANVAS_API_KEY,
      "canvas-api-url": process.env.CANVAS_API_URL,
      "canvas-course-id-list": process.env.CANVAS_COURSE_ID_LIST,
      timezone: process.env.TIMEZONE,
    },
  };

  //LOGIC TO STAY
  const CANVAS_API_KEY = req.query["canvas-api-key"];
  const CANVAS_API_URL = req.query["canvas-api-url"];

  const canvasCourseIdList = (() => {
    try {
      return JSON.parse(req.query["canvas-course-id-list"]);
    } catch (error) {
      return null;
    }
  })();
  const timezone = req.query.timezone || defaultTimezone;

  if (!CANVAS_API_KEY) {
    res.status(400).send("Canvas API key is required");
    return; // Exit the function
  }
  if (!CANVAS_API_URL) {
    res.status(400).send("Canvas API url is required");
    return; // Exit the function
  }
  if (!canvasCourseIdList) {
    res.status(400).send("Valid Course ID list is required");
    return; // Exit the function
  }

  let courseIdAssignmentsMap = new Map();
  for (let courseId of canvasCourseIdList) {
    let assignments = [];
    try {
      assignments = await canvas.getAssignments(
        CANVAS_API_KEY,
        CANVAS_API_URL,
        courseId,
        timezone
      );
    } catch (error) {
      res.status(400).send({ error }); //rewrite this catch block for more standard and specific error handling
      return;
    }
    courseIdAssignmentsMap.set(courseId, assignments);
  }

  let serializedJsonOutput = Object.fromEntries(courseIdAssignmentsMap);
  res.status(200).json(serializedJsonOutput);
});

app.post("/api/create-new-assignment-pages", (req, res) => {
  let mockReq = {
    data: {
      "notion-api-key": process.env.NOTION_API_KEY,
      "canvas-api-key": process.env.CANVAS_API_KEY,
      "canvas-api-url": process.env.CANVAS_API_URL,
      "canvas-course-id-list": process.env.CANVAS_COURSE_ID_LIST,
      timezone: process.env.TIMEZONE,

      "assignments-page-details": {
        "notion-assignments-database-id":
          process.env.NOTION_ASSIGNMENTS_DATABASE_ID,
        "notion-assignments-date-field-name":
          process.env.NOTION_ASSIGNMENTS_DATE_FIELD_NAME,
        "notion-assignments-assignment-type-field-name":
          process.env.NOTION_ASSIGNMENTS_ASSIGNMENT_TYPE_FIELD_NAME,
        "notion-assignments-course-field-name":
          process.env.NOTION_ASSIGNMENTS_COURSE_FIELD_NAME,
        "notion-assignments-assignment-id-field-name":
          process.env.NOTION_ASSIGNMENTS_ASSIGNMENT_ID_FIELD_NAME,
        "notion-assignments-url-field-name":
          process.env.NOTION_ASSIGNMENTS_URL_FIELD_NAME,
      },
      "classes-page-details": {
        "notion-classes-database-id": process.env.NOTION_CLASSES_DATABASE_ID,
        "notion-classes-course-id-field-name":
          process.env.NOTION_CLASSES_COURSE_ID_FIELD_NAME,
      },
    },
  };

  const NOTION_API_KEY = mockReq.data["notion-api-key"];
  const CANVAS_API_KEY = mockReq.data["canvas-api-key"];
  const CANVAS_API_URL = mockReq.data["canvas-api-url"];
  const canvasCourseIdList = (() => {
    try {
      return JSON.parse(mockReq.data["canvas-course-id-list"]);
    } catch (error) {
      return null;
    }
  })();
  const assignmentsPageDetails = {
    notionAssignmentsDatabaseId:
      mockReq.data["assignments-page-details"][
        "notion-assignments-database-id"
      ],
    notionAssignmentsDateFieldName:
      mockReq.data["assignments-page-details"][
        "notion-assignments-assignment-type-field-name"
      ],
    notionAssignmentsAssignmentTypeFieldName:
      mockReq.data["assignments-page-details"][
        "notion-assignments-assignment-type-field-name"
      ],
    notionAssignmentsCourseFieldName:
      mockReq.data["assignments-page-details"][
        "notion-assignments-course-field-name"
      ],
    notionAssignmentsAssignmentIdFieldName:
      mockReq.data["assignments-page-details"][
        "notion-assignments-assignment-id-field-name"
      ],
    notionAssignmentsUrlFieldName:
      mockReq.data["assignments-page-details"][
        "notion-assignments-url-field-name"
      ],
  };
  const coursePageDetails = {
    notionClassesDatabaseId:
      mockReq.data["classes-page-details"]["notion-classes-database-id"],
    notionClassesCourseIdFieldName:
      mockReq.data["classes-page-details"][
        "notion-classes-course-id-field-name"
      ],
  };
  const timezone = mockReq.data.timezone || defaultTimezone;

  //START HERE, FIX DEREFERENCING NULL OBJECTS
  //maybe key value pairs?
  const requiredParameters = [
    NOTION_API_KEY,
    CANVAS_API_KEY,
    CANVAS_API_URL,
    canvasCourseIdList,
    assignmentsPageDetails,
    assignmentsPageDetails.notionAssignmentsDatabaseId,
    assignmentsPageDetails.notionAssignmentsAssignmentIdFieldName,
    coursePageDetails,
    coursePageDetails.notionClassesDatabaseId,
    coursePageDetails.notionClassesCourseIdFieldName,
  ];

  for (let parameter of requiredParameters) {
    if (parameter == undefined || parameter == null) {
      res.status(400).send(`Error invalid parameters`);
      return;
    }
  }
  //at this point you can assume the following variables are populated:
  //  NOTION_API_KEY, CANVAS_API_KEY, CANVAS_API_URL,
  //  timezone, canvasCourseIdList,
  //  assignmentsPageDetails.notionAssignmentsDatabaseId, assignmentsPageDetails.notionAssignmentsAssignmentIdFieldName,
  //if first variable is populated you can assume second variable is populated
  //  coursePageDetails.notionClassesDatabaseId, coursePageDetails.notionClassesCourseIdFieldName,
  //it is possible for these variables to be undefined
  //  assignmentsPageDetails.notionAssignmentsDateFieldName, assignmentsPageDetails.notionAssignmentsAssignmentTypeFieldName
  //  assignmentsPageDetails.notionAssignmentsCourseFieldName,

  /*
  createNewAssignmentPages(
    NOTION_API_KEY,
    CANVAS_API_KEY,
    CANVAS_API_URL,
    canvasCourseIdList,
    assignmentsPageDetails,
    coursePageDetails,
    timezone
  );
  */
  res.send("test");
  /*
  f(!CANVAS_API_URL)
  if (!CANVAS_API_KEY) {
    res.status(400).send("Canvas API key is required");
    return; // Exit the function
  }
  if (!CANVAS_API_URL) {
    res.status(400).send("Canvas API url is required");
    return; // Exit the function
  }
  if (!canvasCourseIdList) {
    res.status(400).send({
      error: "Bad Request",
      description: "Valid Course ID list is required",
    });
    return; // Exit the function
  }
  if (!assignmentsPageDetails) {
    res.status(400).send("Notion Assignments Database ID is required");
    return; // Exit the function
  } else {
    if (!assignmentsPageDetails.notionAssignmentsAssignmentIdField) {
      res.status(400).send("Notion 'Assignments ID' field name is required");
      return; // Exit the function
    }
    if(!)

  try {
    let data = await createNewPages();
    const mapObject = Object.fromEntries(data);
    res.json(mapObject);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
  */
});

app.put("/api/update-assignments", async (req, res) => {
  //
});

app.post("/api/data", (req, res) => {
  // Handle the POST request here
  // You can access the data sent in the request with req.body
});

app.get("/api/hello-world", (req, res) => {
  res.json({ greeting: "Hello, world!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
