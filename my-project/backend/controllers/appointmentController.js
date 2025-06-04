const Appointment = require('../models/Appointment');

exports.addAppointment = async (req, res) => {
  try {
    const { doctor, date, notes } = req.body;
    const appointment = await Appointment.create({
      user: req.user.id,
      doctor,
      date,
      notes,
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Error creating appointment' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};
