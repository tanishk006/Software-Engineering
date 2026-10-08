const eventModel = require('../models/eventModel');

const getAllEvents = async (req, res, next) => {
  try {
    const { timeframe = 'upcoming', category, search, page = 1, limit = 9 } = req.query;
    const currentUserId = req.user?.user_id || null;

    const result = await eventModel.getEvents({
      timeframe,
      category,
      search,
      page,
      limit,
      currentUserId
    });

    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getEventDetail = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const currentUserId = req.user?.user_id || null;

    const event = await eventModel.getEventById(eventId, currentUserId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const createNewEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      eventTime,
      venue,
      registrationLink,
      maxSeats
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }

    const eventId = await eventModel.createEvent({
      title,
      description,
      category,
      eventDate,
      eventTime,
      venue,
      organizerId: req.user.user_id,
      registrationLink: registrationLink || null,
      maxSeats: maxSeats ? Number(maxSeats) : null,
      imageUrl
    });

    const created = await eventModel.getEventById(eventId, req.user.user_id);

    res.status(201).json({
      success: true,
      message: 'Event published successfully.',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

const updateExistingEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const existing = await eventModel.getEventById(eventId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Ownership check: only event organizer or Admin can modify
    if (existing.organizer_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event.'
      });
    }

    const {
      title,
      description,
      category,
      eventDate,
      eventTime,
      venue,
      registrationLink,
      maxSeats
    } = req.body;

    let imageUrl = undefined;
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }

    await eventModel.updateEvent(eventId, {
      title,
      description,
      category,
      eventDate,
      eventTime,
      venue,
      registrationLink,
      maxSeats: maxSeats ? Number(maxSeats) : null,
      imageUrl
    });

    const updated = await eventModel.getEventById(eventId, req.user.user_id);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const removeEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const existing = await eventModel.getEventById(eventId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Ownership check
    if (existing.organizer_id !== req.user.user_id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event.'
      });
    }

    await eventModel.deleteEvent(eventId);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const rsvpEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const existing = await eventModel.getEventById(eventId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    await eventModel.registerForEvent(eventId, req.user.user_id);

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event.'
    });
  } catch (error) {
    next(error);
  }
};

const cancelRsvpEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    await eventModel.unregisterFromEvent(eventId, req.user.user_id);

    res.status(200).json({
      success: true,
      message: 'Registration cancelled.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventDetail,
  createNewEvent,
  updateExistingEvent,
  removeEvent,
  rsvpEvent,
  cancelRsvpEvent
};
