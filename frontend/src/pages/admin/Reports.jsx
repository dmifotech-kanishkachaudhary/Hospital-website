import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../config";
import AdminNavbar from "../../components/AdminNavbar";
import "./Reports.css";

function Reports() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/api/reports/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setReports(data.reports);
      setFilteredReports(data.reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase();

    setFilteredReports(
      reports.filter((report) => {
        return (
          report.reportName?.toLowerCase().includes(value) ||
          report.reportType?.toLowerCase().includes(value) ||
          report.patient?.name?.toLowerCase().includes(value) ||
          report.patient?.email?.toLowerCase().includes(value)
        );
      })
    );
  }, [search, reports]);

  return (
    <div className="admin-reports-page">

      {/* NAVBAR */}

      <AdminNavbar activePage="reports" />

      <main className="admin-reports-container">

        <div className="admin-reports-header">

          <div>

            <span>MEDICAL REPORT MANAGEMENT</span>

            <h1>Medical Reports</h1>

            <p>
              View and manage uploaded medical reports.
            </p>

          </div>

          <div className="report-count">

            <strong>
              {filteredReports.length}
            </strong>

            <span>Reports</span>

          </div>

        </div>

        <div className="report-search">

          <input
            type="text"
            placeholder="Search by patient name, email, report..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {loading ? (

          <div className="report-state">
            Loading Reports...
          </div>

        ) : error ? (

          <div className="report-state">
            {error}
          </div>

        ) : (

          <table className="reports-table">

            <thead>

              <tr>
                <th>Patient</th>
                <th>Report</th>
                <th>Type</th>
                <th>Status</th>
                <th>Email</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredReports.map((report) => (

                <tr key={report._id}>

                  <td>

                    <strong>
                      {report.patient?.name}
                    </strong>

                    <br />

                    {report.patient?.email}

                  </td>

                  <td>{report.reportName}</td>

                  <td>{report.reportType}</td>

                  <td>{report.status}</td>

                  <td>
                    {report.emailSent
                      ? "Sent"
                      : "Pending"}
                  </td>

                  <td>
                    {new Date(
                      report.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td>

                    <button
                      className="view-report-btn"
                      onClick={() =>
                        navigate(
                          `/admin/reports/${report._id}`
                        )
                      }
                    >
                      View Details →
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </main>

    </div>
  );
}

export default Reports;