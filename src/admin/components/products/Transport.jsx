import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import axios from "axios";
import baseurl from "../../../apiService/apiService";
import "../products/Transport.css";

const Transport = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [transports, setTransports] = useState([]);
  const [viewTransport, setViewTransport] = useState(null);
  const [currentTransport, setCurrentTransport] = useState({
    travelsName: "",
    location: "",
    driverName: "",
    contactPersonName: "",
    phoneNo: "",
    email: "",
  });

  useEffect(() => {
    fetchTransport();
  }, []); // Removed currentTransport dependency

  const fetchTransport = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/transport`);
      // Ensure we have valid data before processing
      if (response.data && Array.isArray(response.data.transports)) {
        const validTransports = response.data.transports.filter(transport => 
          transport && 
          typeof transport === 'object'
        );
        setTransports(validTransports);
      } else {
        console.error("Invalid response format:", response.data);
        setTransports([]);
      }
    } catch (error) {
      console.error("Error fetching transports:", error);
      setTransports([]);
    }
  };

  const fetchTransportDetails = async (id) => {
    try {
      const response = await axios.get(`${baseurl}/api/transport/${id}`);
      if (response.data && response.data.transport) {
        setViewTransport(response.data.transport);
        setIsViewModalOpen(true);
      } else {
        throw new Error("Transport details not found");
      }
    } catch (error) {
      console.error("Error fetching transport details:", error);
      alert("Failed to fetch transport details. Please try again later.");
    }
  };

  const handleViewTransport = async (transport) => {
    await fetchTransportDetails(transport.id);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewTransport(null);
  };

  const itemsPerPage = 6;
  const indexOfLastTransport = currentPage * itemsPerPage;
  const indexOfFirstTransport = indexOfLastTransport - itemsPerPage;
  const currentTransports = transports.slice(indexOfFirstTransport, indexOfLastTransport);
  const totalPages = Math.ceil(transports.length / itemsPerPage);

  const handleSearch = () => {
    if (!selectedCity) {
      alert("Please select a city first!");
      return;
    }
    // Implement your search logic here
    alert(`You selected: ${selectedCity}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber < 1 ? 1 : pageNumber > totalPages ? totalPages : pageNumber);
  };

  const toggleModal = () => {
    if (!isModalOpen) {
      // Reset form when opening modal
      setCurrentTransport({
        travelsName: "",
        location: "",
        driverName: "",
        contactPersonName: "",
        phoneNo: "",
        email: "",
      });
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert transportName to travelsName in the handler
    const fieldName = name === "transportName" ? "travelsName" : name;
    setCurrentTransport((prev) => ({ ...prev, [fieldName]: value }));
  };

  const validateForm = () => {
    if (!currentTransport.travelsName || !currentTransport.location || !currentTransport.driverName) {
      alert("Please fill in all required fields!");
      return false;
    }
    
    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(currentTransport.phoneNo)) {
      alert("Please enter a valid 10-digit phone number!");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentTransport.email)) {
      alert("Please enter a valid email address!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (currentTransport.id) {
        // Update existing transport
        const response = await axios.put(
          `${baseurl}/api/updatetransport/${currentTransport.id}`,
          currentTransport
        );
        
        if (response.status === 200) {
          setTransports((prev) =>
            prev.map((transport) =>
              transport.id === currentTransport.id ? response.data.transport : transport
            )
          );
          alert("Transport updated successfully!");
        }
      } else {
        // Add new transport
        const response = await axios.post(`${baseurl}/api/addtransport`, currentTransport);
        
        if (response.status === 200 || response.status === 201) {
          alert("Transport added successfully!");
          await fetchTransport(); // Refresh the list after successful addition
        } else {
          throw new Error("Failed to add transport");
        }
      }

      toggleModal();
    } catch (error) {
      console.error("Error adding/updating transport:", error);
      alert(error.response?.data?.message || "An error occurred while saving the transport. Please try again later.");
    }
  };

  const handleEditTransport = (transport) => {
    setCurrentTransport({
      ...transport,
      phoneNo: transport.phoneNo || "",
      email: transport.email || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteTransport = async (transport) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this transport?");
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${baseurl}/api/deletetransport/${transport.id}`);
        
        if (response.status === 200) {
          await fetchTransport();
          alert("Transport deleted successfully!");
        } else {
          throw new Error("Failed to delete transport");
        }
      } catch (error) {
        console.error("Error deleting transport:", error);
        alert(error.response?.data?.message || "An error occurred while deleting the transport. Please try again later.");
      }
    }
  };

  return (
    <>
      <div className="container mt-2 bg-white" style={{ padding: "20px" }}>
        <div className="row justify-content-center align-items-center">
          <div className="col-md-6 mb-3">
            <select
            style={{padding:'10px'}}
              className="transportSearch"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="" disabled>
                Select a city
              </option>
              {["Coimbatore", "Chennai", "Bangalore", "Mumbai", "Delhi"].map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <button className="transportSearchBtn" onClick={handleSearch}>
              Search
            </button>
          </div>
          <button className="AddTransportBtn" onClick={toggleModal}>
            <i className="bi bi-plus-circle"></i> Add Transport
          </button>
        </div>
      </div>

      <table className="products-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Location</th>
            <th>Travel Name</th>
            <th>Phone Number</th>
            <th>Driver Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(currentTransports) && currentTransports.map((transport, index) => {
            if (!transport || typeof transport !== 'object') return null;
            
            return (
              <tr key={transport.id || index}>
                <td>{index + 1 + indexOfFirstTransport}</td>
                <td>{transport.location || "N/A"}</td>
                <td>{transport.travelsName || "N/A"}</td>
                <td>{transport.phoneNo || "N/A"}</td>
                <td>{transport.driverName || "N/A"}</td>
                <td className="status">
                  <Eye
                    style={{ color: "#091975", cursor: "pointer" }}
                    onClick={() => handleViewTransport(transport)}
                  />
                  <PencilLine
                    style={{ color: "#699BF7", cursor: "pointer" }}
                    onClick={() => handleEditTransport(transport)}
                  />
                  <Trash2
                    style={{ color: "#F24E1E", cursor: "pointer" }}
                    onClick={() => handleDeleteTransport(transport)}
                  />
                </td>
              </tr>
            );
          })}
          {(!Array.isArray(currentTransports) || currentTransports.length === 0) && (
            <tr>
              <td colSpan="6" className="text-center">No transports found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="container d-flex mt-2 justify-content-between">
        <div className="results-count text-center mb-3">
          Showing {currentTransports.length === 0 ? "0" : "1"} to {currentTransports.length} of{" "}
          {transports.length} entries
        </div>
        <Pagination className="justify-content-center" style={{ gap: "10px" }}>
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <MdChevronLeft />
          </Pagination.Prev>
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdChevronRight />
          </Pagination.Next>
        </Pagination>
      </div>
{isViewModalOpen && viewTransport && (
  <div className="modal-overlay" onClick={closeViewModal}>
    <div className="modal-content transport-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header d-flex justify-content-between align-items-center mb-4">
        <h2>Transport Details</h2>
        <button 
          onClick={closeViewModal}
          className="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div className="transport-details">
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="detail-group">
              <label className="fw-bold">Transport Name:</label>
              <p className="detail-value">{viewTransport.travelsName || 'N/A'}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="detail-group">
              <label className="fw-bold">Location:</label>
              <p className="detail-value">{viewTransport.location || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="detail-group">
              <label className="fw-bold">Driver Name:</label>
              <p className="detail-value">{viewTransport.driverName || 'N/A'}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="detail-group">
              <label className="fw-bold">Contact Person:</label>
              <p className="detail-value">{viewTransport.contactPersonName || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="detail-group">
              <label className="fw-bold">Phone Number:</label>
              <p className="detail-value">{viewTransport.phoneNo || 'N/A'}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="detail-group">
              <label className="fw-bold">Email:</label>
              <p className="detail-value">{viewTransport.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content transport-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{currentTransport.id ? "Edit Transport" : "Add Transport"}</h2>
            <form onSubmit={handleSubmit} className="transport-registration-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Transport Name</label>
                  <input
                    type="text"
                    name="transportName"
                    value={currentTransport.travelsName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={currentTransport.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Driver Name</label>
                  <input
                    type="text"
                    name="driverName"
                    value={currentTransport.driverName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row d-flex flex-column">
                <p>Who can we contact for this transport?</p>
                <div className="d-flex flex-row gap-3">
                  <div className="form-group">
                    <label>Contact Person Name</label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={currentTransport.contactPersonName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNo"
                      value={currentTransport.phoneNo}
                      onChange={handleInputChange}
                      required
                      pattern="\d{10}"
                      title="Please enter a valid 10-digit phone number"
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={currentTransport.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
      
    </>
  );
};

export default Transport;