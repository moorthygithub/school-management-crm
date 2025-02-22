import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../layout/Layout";
import { IconEdit, IconEye, IconPlus } from "@tabler/icons-react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../base/BaseUrl";
const StudentList = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-student-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStudentData(response.data?.student);
    } catch (error) {
      console.error("Error fetching student List data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "student_admission_no",
        header: "Admission No",
        size: 150,
      },
      {
        accessorKey: "student_admission_date",
        header: "Admission Date",
        size: 150,
      },
      {
        accessorKey: "student_name",
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "student_gender",
        header: "Gender",
        size: 150,
      },
      {
        accessorKey: "student_dob",
        header: "DOB",
        size: 150,
      },
      {
        accessorKey: "student_father_mobile",
        header: "Father Mobile",
        size: 150,
      },

      {
        accessorKey: "student_status",
        header: "Status",
        size: 150,
        Cell: ({ row }) => {
          const { id, student_status } = row.original;
          return (
            <button
              onClick={() => toggleStatus(id, student_status)}
              className={`px-2 py-1 rounded transition-colors ${
                student_status === "Active"
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {student_status}
            </button>
          );
        },
      },

      {
        id: "id",
        header: "Action",
        size: 20,
        enableHiding: false,
        Cell: ({ row }) => {
          const id = row.original.id;

          return (
            <div className="flex gap-2">
              <div
                onClick={() => navigate(`/student-list/editStudent/${id}`)}
                className="flex items-center space-x-2"
                title="Edit"
              >
                <IconEdit className="h-5 w-5 text-blue-500 cursor-pointer" />
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: studentData || [],
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableHiding: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    mantineTableContainerProps: { sx: { maxHeight: "400px" } },

    initialState: { columnVisibility: { address: false } },
  });
  return (
    <Layout>
      <div className="max-w-screen">
        <div className="bg-white p-4 mb-4 rounded-lg shadow-md">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            <h1 className="border-b-2 font-[400] border-dashed border-orange-800 text-center md:text-left">
              Student List
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/student-list/createStudent")}
                className=" flex flex-row items-center gap-1 text-center text-sm font-[400] cursor-pointer  w-[7rem] text-white bg-blue-600 hover:bg-red-700 p-2 rounded-lg shadow-md"
              >
                <IconPlus className="w-4 h-4" /> Student
              </button>
            </div>
          </div>
        </div>

        <div className=" shadow-md">
          <MantineReactTable table={table} />
        </div>
      </div>
    </Layout>
  );
};

export default StudentList;
