const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc         Get all courses
// @route        GET /api/v1/courses
// @route        GET /api/v1/bootcamps/:bootcampId/courses
// @access       Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    //it's for specific bootcamp
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    //this is for getting all of the courses
    res.status(200).json(res.advancedResults);
  }
});

// @desc         Get single course
// @route        GET /api/v1/courses/:id
// @access       Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with an id ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc         Add course
// @route        POST /api/v1/bootcamps/:bootcampId/courses
// @access       Private

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId; //we assign value manually at the bootcamp field in Course model
  req.body.user = req.user.id;

  let bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with an id ${req.params.bootcampId}`),
      404
    );
  }

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id} `,
        401
      )
    );
  }

  const course = Course.create(req.body); //it will also include body property because we assigned manually above.

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc         Update a course
// @route        PUT /api/v1/courses/:id
// @access       Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with an id ${req.params.id}`),
      404
    );
  }

  //Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to update course ${course._id} `,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc         Delete a course
// @route        DELETE /api/v1/courses/:id
// @access       Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with an id ${req.params.id}`),
      404
    );
  }

  //Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to delete course ${course._id} `,
        401
      )
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
