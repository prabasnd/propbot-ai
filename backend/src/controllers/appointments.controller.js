const { Appointment, Lead, User } = require('../models');

const createAppointment = async (req, res) => {
  try {
    const {
      leadId,
      agentId,
      title,
      description,
      appointmentDate,
      appointmentTime,
      location,
      meetingType,
      durationMinutes
    } = req.body;

    const appointment = await Appointment.create({
      businessId: req.businessId,
      leadId,
      agentId,
      title,
      description,
      appointmentDate,
      appointmentTime,
      location,
      meetingType: meetingType || 'site_visit',
      durationMinutes: durationMinutes || 30,
      status: 'scheduled'
    });

    // Update lead status
    await Lead.update(
      { status: 'appointment_set' },
      { where: { id: leadId } }
    );

    const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Lead, as: 'lead' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email', 'phone'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: { appointment: appointmentWithDetails }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create appointment' }
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { date, status, page = 1, limit = 20 } = req.query;

    const where = { businessId: req.businessId };

    if (date) {
      where.appointmentDate = date;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Lead, as: 'lead' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch appointments' }
    });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findOne({
      where: { id: appointmentId, businessId: req.businessId }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' }
      });
    }

    await appointment.update(updates);

    const updatedAppointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Lead, as: 'lead' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update appointment' }
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment
};
