import React, { useContext, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { ClassTimeTablePrint } from "../../components/buttonIndex/ButtonComponents";
import { CreateButton } from "../../components/common/ButttonConfig";
import LoaderComponent from "../../components/common/LoaderComponent";
import { FETCH_CLASS_TIME_TABLE } from "../../components/common/UseApi";
import useApiToken from "../../components/common/useApiToken";
import { ContextPanel } from "../../context/ContextPanel";
import Layout from "../../layout/Layout";

const Timetable = () => {
  const containerRef = useRef(null);
  const [timetableData, setTimetableData] = useState({
    classes: [],
    teacherAssign: [],
    periods: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeClass, setActiveClass] = useState(null);
  const { selectedYear } = useContext(ContextPanel);
  const token = useApiToken();
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const cellWidth = "80px";
  const cellHeight = "40px";
  const dayColumnWidth = "100px";

  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "class_timetable",
    pageStyle: `
                @page {
                size: A4 landscape;
                margin: 5mm;

              }
              @media print {
                body {
                  border: 0px solid #000;
                      font-size: 10px;
                  margin: 0mm;
                  padding: 0mm;
                }
                   table {
                   font-size: 11px;
                 }
                .print-hide {
                  display: none;
                }

              }
              `,
  });


  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);

        const response = await FETCH_CLASS_TIME_TABLE(selectedYear, token);

        const periods = response.shool_period.map(
          (period) => period.school_period
        );
        const classes = response.classes;

        setTimetableData({
          classes: classes,
          teacherAssign: response.teacherAssign,
          periods,
        });

        if (classes.length > 0 && !activeClass) {
          setActiveClass(classes[0].classes);
        }
      } catch (error) {
        setError("Failed to fetch timetable data");
        console.error("Error fetching timetable data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedYear]);

  const getSubjectForClassDayPeriod = (classValue, day, period) => {
    const assignment = timetableData.teacherAssign.find(
      (item) =>
        item.teachersub_class === classValue &&
        item.teachersub_on === day &&
        item.teachersub_period === period
    );

    return assignment ? assignment.teachersub_subject : "";
  };

  const filterByClass = (className) => {
    setActiveClass(className);
  };

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoaderComponent />
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </Layout>
    );

  const classList = timetableData.classes.map((classObj) => classObj.classes);
  const totalWidth =
    parseInt(dayColumnWidth) +
    timetableData.periods.length * parseInt(cellWidth);

  return (
    <Layout>
      <div className="p-4 w-full bg-white rounded-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-left text-black ">
            Class Timetable {selectedYear}
          </h1>
          <div className="flex flex-wrap gap-2">
            {classList.map((className) => (
              <button
                key={className}
                onClick={() => filterByClass(className)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  activeClass === className
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        </div>
        <div className="">
          {/* <button onClick={handlPrintPdf} className={CreateButton}>
            Print
          </button> */}
          <ClassTimeTablePrint onClick={handlPrintPdf} className={CreateButton}>
            Print
          </ClassTimeTablePrint>
        </div>
        <div ref={containerRef}>
          <div className="mb-6 mt-6">
            <h2 className="text-lg text-center font-semibold mb-2">
              {" "}
              Class:{activeClass}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <div style={{ minWidth: `${totalWidth}px` }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  border: "1px solid black",
                }}
              >
                <thead>
                  <tr>
                    <th
                      rowSpan="2"
                      className="text-center font-semibold p-2 text-black bg-white"
                      style={{
                        width: dayColumnWidth,
                        border: "1px solid black",
                        height: cellHeight,
                      }}
                    >
                      Day
                    </th>
                    {timetableData.periods.map((period) => (
                      <th
                        key={period}
                        colSpan="1"
                        className="text-center font-semibold p-2 text-black bg-white"
                        style={{
                          border: "1px solid black",
                          height: cellHeight,
                          width: cellWidth,
                        }}
                      >
                        {period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day}>
                      <td
                        className="text-center font-medium p-2 text-black bg-white"
                        style={{
                          width: dayColumnWidth,
                          border: "1px solid black",
                          height: cellHeight,
                        }}
                      >
                        {day}
                      </td>
                      {timetableData.periods.map((period) => {
                        const subject = activeClass
                          ? getSubjectForClassDayPeriod(
                              activeClass,
                              day,
                              period
                            )
                          : "";
                        return (
                          <td
                            key={`${activeClass}-${day}-${period}`}
                            className="text-center p-1 text-sm text-black bg-white"
                            style={{
                              width: cellWidth,
                              border: "1px solid black",
                              height: cellHeight,
                            }}
                          >
                            {subject}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Timetable;
