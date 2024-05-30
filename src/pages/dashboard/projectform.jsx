import React, { useState, useEffect } from "react";
import { Button, Select, Option, Textarea, Input, Typography } from "@material-tailwind/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import createData from "@/api/activity/createData";
import getDetail from "@/api/activity/getDetail";
import updateData from "@/api/activity/updateData";
import { useContext } from "react";
import { IsLogin } from "@/context";
import { getCookie } from "cookies-next";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from "dayjs";
import { toast } from "react-toastify";

export function ProjectForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = useContext(IsLogin)
  const [isCategory, setCategory] = useState()

  const isProjectPath = location.pathname.includes('project');
  const isActivityPath = location.pathname.includes('activity');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    picOne: "",
    picTwo: "",
    crNumber: "",
    UIC: "",
    timeline: null,
    status: "",
    category: "",
  });

  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    picOne: "",
    crNumber: "",
    UIC: "",
    timeline: "",
    status: "",
  });

  const validateForm = () => {
    let valid = true;
    const errors = {};

    // Check if title is filled
    if (!formData.title.trim()) {
      errors.title = "Title is required";
      valid = false;
    }

    // Check if description is filled
    if (!formData.description.trim()) {
      errors.description = "Description is required";
      valid = false;
    }

    // Check if picOne is filled
    if (!formData.picOne.trim()) {
      errors.picOne = "PicOne is required";
      valid = false;
    }

    // Check if crNumber is filled
    if (!formData.crNumber.trim()) {
      errors.crNumber = "CR Number is required";
      valid = false;
    }

    // Check if UIC is filled
    if (!formData.UIC.trim()) {
      errors.UIC = "UIC is required";
      valid = false;
    }

    // Check if timeline is selected
    if (!formData.timeline) {
      errors.timeline = "Timeline is required";
      valid = false;
    }

    // Check if status is filled
    if (!formData.status.trim()) {
      errors.status = "Status is required";
      valid = false;
    }

    setFormErrors(errors);
    // console.log(errors)
    return valid;
  };


  const handleChange = (e) => {
    // console.log(formData.subCategory)
    const { name, value } = e.target;
    if (name === "timeline") {
      const formattedDate = dayjs(value).format('YYYY-MM-DD');
      setFormData({
        ...formData,
        [name]: formattedDate
      });
      return;
    }
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // validateForm()
    setCategory(isActivityPath ? "2" : isProjectPath ? "1" : null)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(validateForm)
    if (validateForm()) {
      // console.log(formErrors)
      const res = id ? await updateData(formData, getCookie('token')) : await createData(formData, getCookie('token'))
      if (res) {
        if (res.status === '200') {
          navigate(id ? `./../..` : './../')
        }
      }
      return;
    }
    // const isLogin = await CheckToken(getCookie('token'))
    // if (isLogin) {


  };

  const timelineConfigs = {
    project: {
      label: "Project timeline",
      format: "MM/YYYY",
      views: ['year', 'month']
    },
    activity: {
      label: "Deadline Activity",
      format: "DD/MM/YYYY",
      views: ['year', 'month', 'day']
    },
  }
  const getTimelineConfig = (category) => {
    return timelineConfigs[category] || {};
  }

  const timelineConfig = getTimelineConfig(isActivityPath ? "activity" : isProjectPath ? "project" : null);

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, ['category']: isCategory }));
  }, [isCategory])

  useEffect(() => {
    async function getDetailData() {
      const res = await getDetail(id)
      if (res) {
        if (res.status === '200') {
          setFormData(res.data)
        }
      }
    }

    if (id) {
      getDetailData();
    }
  }, [id]);

  useEffect(() => {
    const errorKeysToCheck = ['timeline', 'status'];
    const firstErrorKey = errorKeysToCheck.find(key => formErrors[key]);
    if (firstErrorKey) {
      toast.error(formErrors[firstErrorKey], {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [formErrors.timeline, formErrors.status]);

  return (
    isLogin ? (
      <form onSubmit={handleSubmit} className="your-form-classname">
        <div className="flex mb-3 w-2/5 flex-col md:flex-row">
          <div className="flex w-36 justify-start items-center">
            <label htmlFor="title" className="p-4">
              Title
            </label>
          </div>
          <Input
            placeholder={!formErrors.title && "Title"}
            rows={1}
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            variant="standard"
            error={formErrors.title} // error is true if formErrors.title is not an empty string
            label={formErrors.title}
          />
        </div>
        <div className="flex mb-3">
          <div className="flex w-32 justify-start items-start mt-4">
            <label htmlFor="description" className=" px-4 ">
              Description
            </label>
          </div>
          <Textarea
            variant="standard"
            placeholder={!formErrors.description && "Description"}
            rows={10}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={formErrors.description}
            label={formErrors.description}
          />
        </div>
        <div className=" flex mb-3 w-2/5 flex-col md:flex-row">
          <div className="flex w-36 justify-start items-center">
            <label htmlFor="picOne" className="p-4">
              PIC 1
            </label>
          </div>
          <Input
            placeholder={!formErrors.picOne && "PIC 1"}
            id="picOne"
            name="picOne"
            value={formData.picOne}
            onChange={handleChange}
            variant="standard"
            error={formErrors.picOne}
            label={formErrors.picOne}
          />
        </div>
        <div className="flex mb-3 w-2/5 flex-col md:flex-row">
          <div className="flex w-36 justify-start items-center">
            <label htmlFor="picTwo" className="p-4">
              PIC 2
            </label>
          </div>
          <Input
            placeholder="PIC 2"
            rows={1}
            id="picTwo"
            name="picTwo"
            value={formData.picTwo}
            onChange={handleChange}
            variant="standard"
          />
        </div>
        <div className="flex mb-3 w-2/5 flex-col md:flex-row">
          <div className="flex w-36 justify-start items-center">
            <label htmlFor="crNumber" className="p-4">
              {isActivityPath ? "Doc Number" : "Cr Number"}
            </label>
          </div>
          <Input
            placeholder={!formErrors.crNumber && (isActivityPath ? "Doc Number" : "Cr Number")}
            id="crNumber"
            name="crNumber"
            value={formData.crNumber}
            onChange={handleChange}
            variant="standard"
            error={formErrors.crNumber}
            label={formErrors.crNumber}
          />
        </div>
        <div className="flex mb-3 w-2/5 flex-col md:flex-row">
          <div className="flex w-36 justify-start items-center">
            <label htmlFor="UIC" className="p-4">
              UIC
            </label>
          </div>
          <Input
            placeholder={!formErrors.UIC && "UIC"}
            id="UIC"
            name="UIC"
            value={formData.UIC}
            onChange={handleChange}
            variant="standard"
            error={formErrors.UIC}
            label={formErrors.UIC}
          />
        </div>
        <div className={`flex mb-3 items-center w-2/5 md:w-3/5`}>
          {
            (isActivityPath) ?
              <Select
                label="Progress"
                value={formData.status}
                onChange={(value) => handleChange({ target: { name: "status", value } })}
                name="status"
              >

                <Option value="8">Pending On SLA</Option>
                <Option value="10">Pending Over SLA</Option>
                <Option value="9">Done</Option>

              </Select>
              :
              <Select
                label="Progress"
                value={formData.status}
                onChange={(value) => handleChange({ target: { name: "status", value } })}
                name="status"
              >

                <Option value="7">Requirement</Option>
                <Option value="1">Design</Option>
                <Option value="2">Development</Option>
                <Option value="3">Testing</Option>
                <Option value="4">Promote</Option>
                <Option value="5">PIR</Option>
                <Option value="6">Go Live</Option>

              </Select>
          }
        </div>
        <div className="flex mb-3 w-2/5 md:w-3/5">
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <DemoContainer components={['DatePicker']}>
              <DatePicker label={timelineConfig.label}
                value={id ? dayjs(formData.timeline) : null}
                format={timelineConfig.format}
                views={timelineConfig.views} disablePast
                onChange={(value) => handleChange({ target: { name: "timeline", value } })} />
            </DemoContainer>

          </LocalizationProvider>
        </div>
        <Button type="submit" className="your-button-classname" >
          Submit
        </Button>
      </form>
    ) : id ? navigate('./../..') : navigate('./..')
  );
};

export default ProjectForm;
