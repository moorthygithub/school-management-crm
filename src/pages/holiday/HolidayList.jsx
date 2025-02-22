import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../layout/Layout";
import { IconEdit, IconEye, IconPlus } from "@tabler/icons-react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../base/BaseUrl";
import moment from "moment/moment";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { IconTrash } from "@tabler/icons-react";
const HolidayList = () => {
  const [holidayData, setHolidayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchHolidayData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-holiday-list/2024-25`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHolidayData(response.data?.holidayList);
    } catch (error) {
      console.error("Error fetching holiday List data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidayData();
  }, []);
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${BASE_URL}/api/panel-delete-holiday-list/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHolidayData((prev) => prev.filter((item) => item.id !== deleteId));
    } catch (error) {
      console.error("Error deleting holiday", error);
    } finally {
        setDeleteDialogOpen(false); 
        setDeleteId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "holiday_date",
        header: "Date",
        size: 150,

        Cell: ({ row }) => {
          const date = row.original.holiday_date;
          return date ? moment(date).format("DD-MMM-YYYY") : "";
        },
      },

      {
        accessorKey: "holiday_for",
        header: "Holiday For",
        size: 150,
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
                onClick={() => navigate(`/holiday-list/editHoliday/${id}`)}
                className="flex items-center space-x-2"
                title="Edit"
              >
                <IconEdit className="h-5 w-5 text-blue-500 cursor-pointer" />
              </div>
              <div
                                             onClick={() => {
                                                 setDeleteId(id);
                                                 setDeleteDialogOpen(true);
                                             }}
                                             className="flex items-center space-x-2 cursor-pointer"
                                             title="Delete"
                                         >
                                             <IconTrash className="h-5 w-5 text-red-500" />
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
    data: holidayData || [],
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
              Holiday List
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/holiday-list/createHoliday")}
                className=" flex flex-row items-center gap-1 text-center text-sm font-[400] cursor-pointer  w-[7rem] text-white bg-blue-600 hover:bg-red-700 p-2 rounded-lg shadow-md"
              >
                <IconPlus className="w-4 h-4" /> Holiday
              </button>
            </div>
          </div>
        </div>

        <div className=" shadow-md">
          <MantineReactTable table={table} />
        </div>
      
      </div>
        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteDialogOpen}
          handler={() => setDeleteDialogOpen(false)}
        >
          <DialogHeader>Confirm Delete</DialogHeader>
          <DialogBody>
            <p>Are you sure you want to delete this holiday?</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
    </Layout>
  );
};

export default HolidayList;
