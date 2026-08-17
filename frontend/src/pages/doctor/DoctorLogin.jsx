import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/doctor.css";

function DoctorLogin() {

  const navigate = useNavigate();

  const [form,setForm]=useState({
    email:"",
    password:""
  });

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handleChange=(e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();

    setLoading(true);
    setError("");

    try{

      const res=await fetch("http://localhost:5000/api/doctors/login", {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(form)
      });

      const data=await res.json();

      console.log(data);

      if(!res.ok){
        throw new Error(data.message);
      }

      localStorage.setItem("token", data.token);

        localStorage.setItem(
            "doctor",
            JSON.stringify(data.doctor)
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        navigate("/doctor/dashboard");

    }

    catch(err){
      setError(err.message);
    }

    setLoading(false);

  };

  return(

<div className="doctor-login-page">

<div className="doctor-login-card">

<h2>Doctor Login</h2>

<p>City Hospital Portal</p>

<form onSubmit={handleSubmit}>

<input
type="email"
name="email"
placeholder="Email"
value={form.email}
onChange={handleChange}
/>

<input
type="password"
name="password"
placeholder="Password"
value={form.password}
onChange={handleChange}
/>

{error && <div className="error">{error}</div>}

<button>

{loading ? "Signing In..." : "Login"}

</button>

</form>

</div>

</div>

  );

}

export default DoctorLogin;