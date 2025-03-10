import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { IconInfoCircle } from "@tabler/icons-react";
import { FormLabel } from "@mui/material";
import axios from "axios";
import BASE_URL from "../../base/BaseUrl";
import { toast } from "sonner";
import {
  CreateButton,
  HeaderColor,
} from "../../components/common/ButttonConfig";
import { ReportTeacherDownload } from "../../components/buttonIndex/ButtonComponents";
const status = [
  {
    value: "Active",
    label: "Active",
  },
  {
    value: "Inactive",
    label: "Inactive",
  },
];
const TeacherReport = () => {
  const [yearData, setYearData] = useState([]);
  const [teacherdesignation, setTeacherDesignation] = useState([]);

  const [report, setReport] = useState({
    teacher_year: "",
    teacher_status: "",

    teacher_designation: "",
  });
  const onInputChange = (e) => {
    setReport({
      ...report,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchYearData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-year-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setYearData(response.data?.year);
      } catch (error) {
        console.error("Error fetching holiday List data", error);
      }
    };
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-usertypes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTeacherDesignation(response.data.userType);
      } catch (error) {
        console.error("Error fetching teacher data", error);
      }
    };
    fetchTeacherData();
    fetchYearData();
  }, []);

  const handleTeacher = (e) => {
    e.preventDefault();
    let data = {
      teacher_year: report.teacher_year,
      teacher_status: report.teacher_status,
      teacher_designation: report.teacher_designation,
    };

    e.preventDefault();

    axios({
      url: BASE_URL + "/api/panel-download-teacher-details-report",
      method: "POST",
      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "teacher_details.csv");
        document.body.appendChild(link);
        link.click();
        toast.success("Teacher Details Downloaded Successfully");
        setReport({
          teacher_year: "",
          teacher_status: "",

          teacher_designation: "",
        });
      })
      .catch((err) => {
        toast.error("Teacher Details is Not Downloaded");
      });
  };

  const FormLabel = ({ children, required }) => (
    <label className="block text-sm font-semibold text-black mb-1 ">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
  const inputClassSelect =
    "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-blue-500";

  return (
    <Layout>
      <div className=" bg-[#FFFFFF] p-2  rounded-lg  ">
        <div className={HeaderColor}>
          <h2 className=" px-5 text-[black] text-lg   flex flex-row  justify-between items-center  rounded-xl p-2 ">
            <div className="flex  items-center gap-2">
              <IconInfoCircle className="w-4 h-4" />
              <span>Download Teacher Report </span>
            </div>
          </h2>
        </div>
        <hr />
        <form
          className="w-full   rounded-lg mx-auto p-4 space-y-6"
          onSubmit={handleTeacher}
        >
          <div className="grid grid-cols-1  md:grid-cols-3  gap-6">
            {/* present Date  */}
            <div>
              <FormLabel>Year</FormLabel>
              <select
                name="teacher_year"
                value={report.teacher_year || ""}
                onChange={onInputChange}
                className={inputClassSelect}
              >
                <option value="">Select Year</option>
                {yearData.map((option, index) => (
                  <option key={index} value={option.year_list}>
                    {option.year_list}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FormLabel>Status</FormLabel>
              <select
                name="teacher_status"
                value={report.teacher_status || ""}
                onChange={onInputChange}
                className={inputClassSelect}
              >
                <option value="">Select Status</option>
                {status.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FormLabel>Designation</FormLabel>
              <select
                name="teacher_designation"
                value={report.teacher_designation || ""}
                onChange={onInputChange}
                className={inputClassSelect}
              >
                <option value="">Select Designation</option>
                {teacherdesignation.map((option, index) => (
                  <option key={index} value={option.user_position}>
                    {option.user_position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* <button type="submit" className={CreateButton}>
              Download
            </button> */}
            <ReportTeacherDownload type="submit" className={CreateButton}>
              Download
            </ReportTeacherDownload>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TeacherReport;
