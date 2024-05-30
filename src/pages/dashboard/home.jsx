import React, { useContext, useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  IconButton,
  Menu,
  MenuHandler,
  Chip,
  Button,
  Input,
  Select,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Checkbox,
  Option,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import {
  PlusIcon,
  UserCircleIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { statisticsCardsData } from "@/data";
import { Link, useLocation } from "react-router-dom";
import getData from "@/api/activity/getData";
import getStatusInfo from "@/handlers/getStatusInfo";
import getTimelineInfo from "@/handlers/getTimelineInfo";
import { IsLogin } from "@/context";
import { getCookie, setCookie } from "cookies-next";
import GetAnalyze from "@/api/activity/getAnalyze";
import searchData from "@/api/activity/searchData";
import downloadXls from "@/api/activity/downloadXls";
import updateStatus from "@/api/activity/updateStatus";
import getMasterDataFilter from "@/api/activity/getMasteraDataFilter";
import searchFilter from "@/api/activity/searchFilter";
import dayjs from "dayjs";

export function Home() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const isLogin = useContext(IsLogin);
  const [dataSearch, setDataSearch] = useState("");
  const [dataAnalyze, setDataAnalyze] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [dataAnalyzeRank, setDataAnalyzeRank] = useState([]);
  const [rowToggleStatus, setRowToggleStatus] = useState({});
  const [masterDataFilter, setMasterDataFilter] = useState([])
  const [handleOpenFilter, setHandleOpenFilter] = useState(false);
  const [spesificBusinessPlan, setSpesificBusinessPLan] = useState(0);

  const [loading, setLoading] = useState(true);

  const isProjectPath = location.pathname.includes("project");
  const isActivityPath = location.pathname.includes("activity");
  const isBusinessPlanPath = location.pathname.includes("business-plan");

  const handleFilter = () => setHandleOpenFilter(!handleOpenFilter);

  const category = isBusinessPlanPath
    ? "Business plan"
    : isActivityPath
      ? "Activity"
      : isProjectPath
        ? "Project"
        : "";

  const projects = ["RPA", "City Net", "EUC", "Pelatihan"];

  const toggleRowStatus = (rowId) => {
    setRowToggleStatus((prevState) => ({
      ...prevState,
      [rowId]: !prevState[rowId], // Toggle the status for the specified row
    }));
  };

  const handleChange = async (e) => {
    const { id, name, value } = e.target;

    // Update the status in the state
    setData((prevData) => {
      const updatedData = prevData.map((item, idx) => {
        if (idx === parseInt(id)) {
          return { ...item, status: value };
        } else {
          return item;
        }
      });

      // Prepare the updated status object to send to the API
      const statusUpdate = {
        id: updatedData[id].id,
        status: value,
        category: updatedData[id].category,
        subCategory: updatedData[id].subCategory,
      };

      // Call the API to update the status
      updateStatus(statusUpdate, getCookie("token"))

      return updatedData;
    });
  };

  async function search() {
    const res = await searchData(dataSearch, isBusinessPlanPath ? "3" : isActivityPath ? "2" : "1");

    if (res.status === "200") {
      setDataSearch("");
      setData(res.data);
    }
  }

  async function searchFilterData(data) {
    const res = await searchFilter(data, isActivityPath ? "2" : "1")

    if (res.status === "200") {
      setData(res.data);
    }
  }

  async function getAnalyze() {
    const res = await GetAnalyze(
      isActivityPath ? "2" : "1",
      isBusinessPlanPath ? spesificBusinessPlan + 1 : "",
    );
    if (res) {
      if (res.status === "200") {
        setDataAnalyze(res.data.summary);
        setDataAnalyzeRank(res.data.summaryRank);
      }
    }
  }

  async function getAllData() {
    const res = await getData(
      isActivityPath ? "2" : "1"
    );
    if (res) {
      if (res.status === "200") {
        setData(res.data);
        setLoading(false)
      }
    }
  }

  async function getMasterData() {
    // if(masterDataFilter.length === 0){
      const res = await getMasterDataFilter(isActivityPath ? "2" : "1")
  
      if (res.status === "200") {
        setMasterDataFilter(res.data)
      }
    
  }

  const getLabel = (key, value) => {
    switch (key) {
      case 'status':
        return getStatusInfo(value).labelStatus;
      case 'timeline':
        return getTimelineInfo(value).label
      default:
        return value;
    }
  };

  const handleCheckboxToggle = (key, value) => {
    setSelectedValues(prevState => ({
      ...prevState,
      [key]: {
        ...(prevState[key] || {}),
        [value]: !(prevState[key] && prevState[key][value])
      }
    }));
  };

  const renderCheckboxes = (dataArray, keyName, handleCheckboxToggle) => {
    return (
      <>
        {dataArray.map((item, index) => (
          <ListItem key={index} className=" h-8 p-0">
            <label className="flex w-full cursor-pointer items-center px-4 py-3">
              <ListItemPrefix>
                <Checkbox
                  ripple={false}
                  checked={(selectedValues[keyName] && selectedValues[keyName][item[keyName]]) || false}
                  onChange={() => handleCheckboxToggle(keyName, item[keyName])}
                />
              </ListItemPrefix>
              <Typography>
                {getLabel(keyName, item[keyName])}
              </Typography>
            </label>
          </ListItem>
        ))}
      </>
    );
  };

  useEffect(() => {
    if (!getCookie("isReload") && getCookie("token")) {
      setCookie("isReload", "true");
      window.location.reload();
    }
    getAnalyze();
    getAllData();
    setRowToggleStatus({})
    setMasterDataFilter([])
  }, [isActivityPath, isProjectPath]);

  useEffect(() => {
    if (handleOpenFilter) {
      getMasterData()
    }
  }, [handleOpenFilter])

  const integratedData = statisticsCardsData.map((card) => {
    const statusCount = dataAnalyze[card.status];
    const statusRankCount = dataAnalyzeRank[card.status];
    return { ...card, count: statusCount ?? 0, rank: statusRankCount ?? {} };
  });
  const headers = [
    "Title",
    "PIC",
    "UIC",
    "Description",
    "CR No",
    "Status",
    "Timeline", // Default header, will be conditionally changed
  ];

  // console.log(masterDataFilter.length)
  return (
    // <SearchBar.Provider value={{ searchData, setSearchData }}>
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {integratedData.map(
          ({ icon, title, footer, color, label, count, rank }, key) => (
            <StatisticsCard
              key={key}
              // {...rest}
              color={color}
              status={label}
              title={title}
              count={count}
              rank={rank}
              icon={React.createElement(icon, {
                className: "w-6 h-6 text-white",
              })}
            />
          ),
        )}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center gap-4 p-6 z-10"
          >
            <div className="flex items-center justify-between w-full gap-3 flex-wrap">
              <div
                className={` flex flex-wrap items-center gap-4 ${isBusinessPlanPath ? "md:flex-1" : ""}`}
              >

                  <div className="py-4">
                    <Typography variant="h6" color="blue-gray" className="mb-1 align-middle">
                      {category}
                    </Typography>
                  </div>
                {
                  isLogin && (
                    <div className={`flex items-start md:flex-1`}>
                      <Link to={`./upload`}>
                        <IconButton
                          size="sm"
                          variant="text"
                          color="blue-gray"
                          onClick={() => console.log("tambah")}
                        >
                          <PlusIcon
                            strokeWidth={3}
                            fill="currenColor"
                            className="h-6 w-6"
                          />
                        </IconButton>
                      </Link>
                    </div>
                  )
                }
              </div>
              <div className="flex items-center justify-center gap-2">
                {
                  isLogin && (
                    <div
                      onClick={() =>
                        downloadXls(
                          isBusinessPlanPath ? "3" : isActivityPath ? "2" : "1",
                          getCookie("token"),
                        )
                      }
                      className=""
                    >
                      <IconButton size="sm" variant="text" color="blue-gray">
                        <DocumentArrowDownIcon
                          strokeWidth={2}
                          // fill="currenColor"
                          className="h-6 w-6"
                        />
                      </IconButton>
                    </div>
                  )
                }
                <div onClick={handleFilter}>
                  <IconButton size="sm" variant="text" color="blue-gray">
                    <FunnelIcon strokeWidth={2} className=" h-6 w-6" />
                  </IconButton>
                </div>
                  <Dialog
                    size="xxl"
                    open={handleOpenFilter}
                    handler={handleFilter}
                    className="bg-transparent shadow-none"
                    dismiss={{
                      escapeKey: true
                    }}
                  >
                    <Card className="mx-auto">
                      <CardBody className="flex flex-row gap-4 justify-center">
                        <Typography variant="h4" color="blue-gray">
                          Filter

                        </Typography>
                        {(handleOpenFilter) && (
                            Object.keys(masterDataFilter).map(key => (
                              <List key={key} className=" ">
                                <Typography variant="h6" color="blue-gray" className="px-4">
                                  {key.substring(10) === "PicOne" ? "PIC" : key.substring(10)}
                                </Typography>
                                {renderCheckboxes(masterDataFilter[key], Object.keys(masterDataFilter[key][0])[0], handleCheckboxToggle)}
                              </List>
                            ))
                        )}
                        <div className="flex items-center">
                          <Button size="sm" onClick={() => {
                            const filters = Object.keys(selectedValues).map(key => ({
                              [key]: Object.keys(selectedValues[key]).filter(value => selectedValues[key][value])
                            }));
                            console.log(filters)
                            setSelectedValues({})
                            setHandleOpenFilter(!handleOpenFilter)
                            if (filters.length !== 0) {
                              searchFilterData(filters)
                            }
                          }}>Search</Button>
                        </div>

                      </CardBody>

                    </Card>
                  </Dialog>
                <div className="md:mr-4 md:w-56">
                  <Input
                    label="Search"
                    id="search"
                    name="search"
                    value={dataSearch}
                    onChange={(e) => setDataSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search();
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {headers.map((el) => {
                    if (el === "Timeline") {
                      return (
                        <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-center whitespace-nowrap">
                          <Typography
                            variant="small"
                            className="text-[11px] font-medium uppercase text-blue-gray-400"
                          >
                            {isProjectPath ? "Timeline" : "Deadline"}
                          </Typography>
                        </th>
                      );
                    } else {
                      return (
                        <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-center whitespace-nowrap">
                          <Typography
                            variant="small"
                            className="text-[11px] font-medium uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      );
                    }
                  }
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <div>Loading...</div>
                ) :
                  data.map(
                    (
                      {
                        id,
                        title,
                        picOne,
                        picTwo,
                        UIC,
                        description,
                        crNumber,
                        status,
                        timeline,
                        updatedAt,
                      },
                      key,
                    ) => {
                      // console.log(timelineActivity)
                      const className = `py-3 px-3 text-center ${key === data.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;
                      const { labelStatus, colorStatus } = getStatusInfo(status);
                      // const {labelTimeline, colorTimeline} = getTimelineInfo(timeline)
                      const dateUtc = new Date(updatedAt);
                      dateUtc.setHours(dateUtc.getHours());

                      return (
                        <tr key={key} className="even:bg-blue-gray-50/50">
                          <td
                            className={`cursor-pointer w-60 ${className}`}
                            onClick={() => {
                              console.log("access profile ");
                            }}
                          >
                            <Link to={`./${id}`}>
                              <Typography
                                variant="small"
                                className="text-xs font-bold text-blue-gray-900 text-center "
                              >
                                {title.length > 65
                                  ? `${title.slice(0, 65)} ...`
                                  : title}
                              </Typography>
                            </Link>
                          </td>
                          <td className={`${className} flex justify-center`}>
                            <div className="flex flex-col gap-4 ml-3">
                              <Chip
                                icon={<UserCircleIcon />}
                                value={
                                  <Typography
                                    variant="small"
                                    color="white"
                                    className="font-medium capitalize leading-none"
                                  >
                                    {picOne}
                                  </Typography>
                                }
                                className="rounded-full px-3 w-32 bg-orange-700"
                              />
                              {picTwo !== "" || picTwo.trim() !== "" ? (
                                <Chip
                                  icon={<UserCircleIcon />}
                                  value={
                                    <Typography
                                      variant="small"
                                      color="white"
                                      className="font-medium capitalize leading-none"
                                    >
                                      {picTwo}
                                    </Typography>
                                  }
                                  className="rounded-full py-1.5 w-32 bg-teal-700"
                                />
                              ) : (
                                <></>
                              )}
                            </div>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {UIC}
                            </Typography>
                          </td>
                          <td className="py-3 px-2 text-left">
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600 text-justify"
                            >
                              {description.length > 100
                                ? `${description.slice(0, 100)} ...`
                                : description}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {crNumber}
                            </Typography>
                          </td>
                          <td className={`${className} `}>
                            {isLogin && rowToggleStatus[key] ? (
                              <Select
                                size="md"
                                variant="standard"
                                value={labelStatus}
                                onChange={(e) => {
                                  handleChange({
                                    target: { id: key, name: "status", value: e },
                                  });
                                  toggleRowStatus(key);
                                }}
                                className="w-32 gap-2"
                                // onChange={(e) => console.log(e)}

                                name="status"
                              >
                                {
                                  isActivityPath ? <>
                                    <Option value="8">Pending On SLA</Option>
                                    <Option value="10">pending Over SLA</Option>
                                    <Option value="9">Done</Option>
                                  </> :
                                    <>
                                      <Option value="7">Requirement</Option>
                                      <Option value="1">Design</Option>
                                      <Option value="2">Development</Option>
                                      <Option value="3">Testing</Option>
                                      <Option value="4">Promote</Option>
                                      <Option value="5">PIR</Option>
                                      <Option value="6">Go Live</Option>
                                    </>
                                }
                              </Select>
                            ) : (
                              <div
                                className={` cursor-pointer`}
                                onClick={() => {
                                  toggleRowStatus(key);
                                }}
                              >
                                <Chip
                                  value={
                                    <Typography
                                      variant="small"
                                      color="white"
                                      className="font-medium capitalize leading-none items-center"
                                    >
                                      {labelStatus}
                                    </Typography>
                                  }
                                  className={`flex rounded-full flex-col items-center w-32 ${colorStatus}`}
                                />
                              </div>
                            )}
                          </td>
                          <td className={`${className}`}>

                              <Chip
                                color={"blue-gray"}
                                value={
                                  <Typography
                                  variant="small"
                                  color="white"
                                  className="font-medium capitalize leading-none"
                                >
                                  {isProjectPath ? dayjs(timeline).format('MMMM YYYY') : dayjs(timeline). format('DD MMMM YYYY')}
                                </Typography>
                                }
                                className={`flex rounded-full flex-col items-center w-32`}
                              />
                          </td>
                          {
                            // isLogin &&
                            // <td className={` flex flex-col gap-2 ${className}`}>
                            // <Typography
                            //       variant="small"
                            //       color='black'
                            //       className="font-medium capitalize leading-none"
                            //       >
                            //   {dateUtc.toDateString()}
                            //       {/* {dateUtc.toDateString()}         */}
                            //       </Typography>
                            // <Typography
                            //       variant="small"
                            //       color='black'
                            //       className="font-medium capitalize leading-none"
                            //       >
                            //   {dateUtc.toTimeString().slice(0,8)}
                            //       </Typography>
                            // </td>
                          }
                        </tr>
                      );
                    },
                  )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
    // </SearchBar.Provider>
  );
}

export default Home;
