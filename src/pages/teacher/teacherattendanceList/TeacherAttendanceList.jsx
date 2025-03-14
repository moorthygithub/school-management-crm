import React, { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../../../layout/Layout";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogContent,
  FormLabel,
  IconButton,
  Slide,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";

import axios from "axios";
import BASE_URL from "../../../base/BaseUrl";
import moment from "moment";
import { toast } from "sonner";
import { ContextPanel } from "../../../context/ContextPanel";
import { Trash } from "lucide-react";
import CreateAttendance from "../../student/attendanceList/CreateAttendance";
import CreateTeacherAttendance from "./CreateAttendance";
import LoaderComponent from "../../../components/common/LoaderComponent";
import { CreateButton } from "../../../components/common/ButttonConfig";
import {
  TeacherAttendanceListCreate,
  TeacherAttendanceListDelete,
} from "../../../components/buttonIndex/ButtonComponents";

const TeacherAttendanceList = () => {
  const [teacherAttendanceData, setTeacherAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { selectedYear } = useContext(ContextPanel);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [attendanceid, setAttendanceId] = useState("");
  const navigate = useNavigate();
  const [attendace, setAttendance] = useState({
    teacherAttendance_date: "",
  });

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-teacher-attendance-list/${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTeacherAttendanceData(response.data?.teacherAttendance);
    } catch (error) {
      console.error("Error fetching student List data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchAttendanceDataId = async () => {
      if (!attendanceid) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-teacher-attendance-by-id/${attendanceid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAttendance({
          teacherAttendance_date:
            response.data.teacherAttendance.teacherAttendance_date || "",
        });
      } catch (error) {
        console.error("Error fetching teacherAttendance data", error);
      }
    };

    fetchAttendanceDataId();
  }, [attendanceid]);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const onInputChange = (e) => {
    setAttendance({
      ...attendace,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = document.getElementById("addIndiv");
    if (!form.checkValidity()) {
      toast.error("Fill all required fields");
      setIsButtonDisabled(false);
      return;
    }
    const data = {
      teacherAttendance_date: attendace.teacherAttendance_date,
    };

    setIsButtonDisabled(true);
    axios({
      url: `${BASE_URL}/api/panel-update-teacher-attendance/${attendanceid}`,
      method: "PUT",
      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        setOpenDialog(false);
        fetchTeacherData();
        setAttendance({
          teacherAttendance_date: "",
        });
      } else if (res.data.code === 400) {
        toast.error(res.data.msg);
      }
      setIsButtonDisabled(false);
    });
  };
  const handleDelete = async (e) => {
    e.preventDefault();

    setIsButtonDisabled(true);
    axios({
      url: `${BASE_URL}/api/panel-delete-teacher-attendance/${attendanceid}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        setOpenDeleteDialog(false);
        fetchTeacherData();
        setAttendance({
          teacherAttendance_date: "",
        });
      } else if (res.data.code === 400) {
        toast.error(res.data.msg);
      }
      setIsButtonDisabled(false);
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "teacher_name",
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "teacher_mobile",
        header: "Mobile",
        size: 150,
      },

      {
        accessorKey: "teacherAttendance_date",
        header: "Date",
        size: 150,
        Cell: ({ row }) => {
          const date = row.original.teacherAttendance_date;
          return date ? moment(date).format("DD-MMM-YYYY") : "";
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
              {/* <div
                onClick={() => {
                  setAttendanceId(id);
                  setOpenDeleteDialog(true);
                }}
                className="flex items-center space-x-2"
                title="Delete"
              >
                <Trash className="h-5 w-5 text-red-500 cursor-pointer" />
              </div> */}
              <TeacherAttendanceListDelete
                onClick={() => {
                  setAttendanceId(id);
                  setOpenDeleteDialog(true);
                }}
                className="flex items-center space-x-2"
              ></TeacherAttendanceListDelete>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: teacherAttendanceData || [],
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableHiding: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    mantineTableContainerProps: { sx: { maxHeight: "400px" } },
  });
  const FormLabel = ({ children, required }) => (
    <label className="block text-sm font-semibold text-black mb-1 ">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
  const inputClass =
    "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-blue-500";

  return (
    <>
      <Layout>
        <div className="max-w-screen">
          <div className="bg-white p-4 mb-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <h1 className="border-b-2 font-[400] border-dashed border-orange-800 text-center md:text-left">
                Teacher Attendance List
              </h1>
              <TeacherAttendanceListCreate
                onClick={() => navigate("/teacher-viewAttendance")}
                className={CreateButton}
              ></TeacherAttendanceListCreate>
            </div>
          </div>

          <div className="shadow-md">
            {!teacherAttendanceData ? (
              <LoaderComponent />
            ) : (
              <MantineReactTable table={table} />
            )}
          </div>
        </div>
      </Layout>
      <CreateTeacherAttendance
        openCreateDialog={openCreateDialog}
        setOpenCreateDialog={setOpenCreateDialog}
        fetchTeacherData={fetchTeacherData}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        sx={{ backdropFilter: "blur(4px)" }}
        TransitionComponent={Slide}
        transitionDuration={500}
      >
        <DialogContent>
          <div className="mt-2">
            <div className="mb-4 flex justify-between">
              <h3 className="font-bold text-xl">Edit Attendance</h3>
              <IconButton edge="end" onClick={() => setOpenDialog(false)}>
                <IconX />
              </IconButton>
            </div>

            <form onSubmit={handleSubmit} id="addIndiv" className="space-y-2">
              <FormLabel required>Date</FormLabel>
              <input
                type="date"
                name="teacherAttendance_date"
                value={attendace.teacherAttendance_date}
                onChange={onInputChange}
                required
                className={inputClass}
              />

              <div className="flex space-x-2 justify-center">
                <button
                  type="submit"
                  disabled={isButtonDisabled}
                  className="text-center text-sm font-[400] cursor-pointer  w-36 text-white bg-blue-600 hover:bg-green-700 p-2 rounded-lg shadow-md"
                >
                  {isButtonDisabled ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  className="text-center text-sm font-[400] cursor-pointer  w-36 text-white bg-red-600 hover:bg-red-400 p-2 rounded-lg shadow-md"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* //for delete */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="sm"
        sx={{ backdropFilter: "blur(4px)" }}
        TransitionComponent={Slide}
        transitionDuration={500}
      >
        <DialogContent>
          <div className="mt-2">
            {/* Header */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-bold text-xl">Delete Attendance</h3>
              <IconButton edge="end" onClick={() => setOpenDeleteDialog(false)}>
                <IconX />
              </IconButton>
            </div>

            {/* Confirmation Text */}
            <div className="mb-4 text-center text-gray-700">
              Are you sure you want to delete the attendance?
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 justify-center">
              <button
                onClick={handleDelete}
                disabled={isButtonDisabled}
                className="text-center text-sm font-medium cursor-pointer w-36 
                     text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-md"
              >
                {isButtonDisabled ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                className="text-center text-sm font-medium cursor-pointer w-36 
                     text-white bg-red-600 hover:bg-red-700 p-2 rounded-lg shadow-md"
                onClick={() => setOpenDeleteDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeacherAttendanceList;
