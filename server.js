const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;

// Mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/teamopine", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const employeeSchema = new mongoose.Schema({
  name: String,
  designation: String,
});

const departmentSchema = new mongoose.Schema({
  name: String,
  totalEmps: String,
});
const departmentEmloyeesSchema = new mongoose.Schema({
  empId: String,
  depId: String,
});

// employee model

const DepartmentEmployee = mongoose.model(
  "DepartmentEmployee",
  departmentEmloyeesSchema
);

const Employee = mongoose.model("employee", employeeSchema);

//employeedeparment
const Department = mongoose.model("department", departmentSchema);

app.use(cors());
app.use(express.json());

// api
app.post("/employees", async function (req, res) {
  const { name, designation, selecteddeparments } = req.body;

  const employee = await Employee.create({ name, designation });

  for (const departmentId of selecteddeparments) {
    await DepartmentEmployee.create({
      empId: employee._id,
      depId: departmentId,
    });
  }

  return res.status(200).json({ message: "Employee created successfully." });
});

app.get("/employees", async function (req, res) {
  try {
    const employees = await Employee.find().exec();

    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
// upadte api
app.put("/employees/:id", async function (req, res) {
  const employeeId = req.params.id;
  const { name, designation } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { name, designation },
      { new: true }
    ).exec();

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/departments/:id", async function (req, res) {
  const departmentId = req.params.id;

  try {
    await Department.findByIdAndRemove(departmentId).exec();
    await DepartmentEmployee.deleteMany({ depId: departmentId }).exec();

    return res
      .status(200)
      .json({ message: "Department deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/departments", async function (req, res) {
  try {
    const departments = await Department.find();
    return res.status(200).json(departments);
  } catch (error) {
    return res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
