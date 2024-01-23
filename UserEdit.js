import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Col,
  Row,
  Modal,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import BootstrapTable from "react-bootstrap-table-next";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import { useDispatch, useSelector } from "react-redux";
import {
  editItem,
  selectRole,
  selectDataId,
  fetchRole,
  fetchId,
} from "./userSlice";
import { useHistory } from "react-router";

import {
  showSuccessDialog,
  showErrorDialog,
  useForceUpdate,
} from "../../../utility";
import Select from "react-select";
import MultiSelectAll from "../../../utility/MultiSelectAll";
import {
  fetchVendor,
  selectVendor,
} from "../../master-data/vendor/vendorSlice";
import { selectUser } from "../../../modules/Auth/_redux/authRedux";
import LoadingFetchData from "../../../utility/LoadingFetchData";
import {
  fetchBispar,
  selectBispar,
} from "../../administration/bussiness-parameter/parameter/parameterSlice";

import UserEdit from './pages/administration/user/UserEdit.js'; // Adjust the path accordingly

const MyComponent = ({ selectedPurchOrg, handlePurchOrgChange }) => {
  const purchOrgOptions = [
    { value: 'A', label: 'Option A' },
    { value: 'B', label: 'Option B (Default)' },
    { value: 'C', label: 'Option C' },
    { value: 'D', label: 'Option D' },
  ];

  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm={2}>
        <b>Select Purch Org</b>
      </Form.Label>
      <Col sm={3}>
        <Select
          options={purchOrgOptions}
          value={purchOrgOptions.find((option) => option.value === selectedPurchOrg)}
          onChange={(selectedOption) => handlePurchOrgChange(selectedOption.value)}
          placeholder="Select..."
        />
      </Col>
    </Form.Group>
  );
};

export const UserEdit = (params) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const roleData = useSelector(selectRole);
  const dataId = useSelector(selectDataId);
  const vendorData = useSelector(selectVendor);
  const user = useSelector(selectUser);
  const dataBispar = useSelector(selectBispar);

  const forceUpdate = useForceUpdate();

  const payload = params.location.state;
  const userName = payload.userName;

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [handphone, setHandphone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState("");
  const [userAd, setUserAd] = useState();
  const [roles, setRoles] = useState([]);
  const [vendorCode, setVendorCode] = useState("");
  const [locked, setLocked] = useState("");
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [purchOrg, setPurchOrg] = useState("");
  const [logs, setLogs] = useState([]);
  const [selectedPurchOrg, setSelectedPurchOrg] = useState('B');

  useEffect(() => {
    async function fetchMyAPI() {
      await dispatch(fetchId(userName));

      if (user.rolesConcat === "superadmin") {
        await dispatch(fetchRole({ vendor_role: "X,Y,N", pageNo: 1, pageSize: -1 }));
      } else {
        await dispatch(fetchRole({ vendor_role: "Y,N", pageNo: 1, pageSize: -1 }));
      }

      await dispatch(fetchBispar({ paramgroup_code: "PURCH_ORG", pageNo: 1, pageSize: -1 }));
      await dispatch(fetchVendor({ pageNo: 1, pageSize: -1 }));
    }
    fetchMyAPI();
  }, [dispatch]);

  useEffect(() => {
    if (dataId != null) {
      setFullname(dataId.fullname);
      setEmail(dataId.user_email);
      setHandphone(dataId.user_phone);
      setWhatsapp(dataId.user_whatsapp);
      setStatus(dataId.status);
      setUserAd(dataId.is_user_ad);
      setVendorCode(dataId.vendor_code);
      setRoles(dataId.roles);
      setLocked(dataId.is_locked);
      setLogs(dataId.logs);
    }
  }, [dataId]);

  const handleRoleChange = (selectedOptions) => {
    if (selectedOptions) {
      setRoles(
        selectedOptions.map((selectedOptions) => selectedOptions["value"])
      );
    } else {
      setRoles([]);
    }
  };

  const roleOptions = roleData.map((val) => ({
    value: val.role_code,
    label: val.role_description,
  }));

  const purchOrgOptions = dataBispar.map((val) => ({
    value: val.param_code,
    label: val.param_value,
  }));

  function getValueRole(roles) {
    return roles.map((val) => {
      const result = roleOptions.filter((role) => val === role.value);
      return result[0];
    });
  }

  const vendorOptions = vendorData.map((e) => ({
    value: e.lfA1_LIFNR,
    label: e.lfA1_NAME1,
  }));

  const getValueVendor = (value, options) => {
    return options.filter((val) => value === val.value);
  };

  const getValuePurchOrg = (value, options) => {
    return options.filter((val) => value === val.value);
  };

  const handleVendorChange = (e, value) => {
    if (e === null) {
      value.vendorCode = "";
      value.userAd = "Y";
    } else {
      value.vendorCode = e.value;
      value.userAd = "N";
    }
    setVendorCode(value.vendorCode);
    setUserAd(value.userAd);
    forceUpdate();
  };

  const handlePurchOrgChange = (e) => {
    if (e === null) {
      e = undefined;
      setPurchOrg("");
    } else {
      setPurchOrg(e.value);
    }
  };

  const handleSave = async () => {
    if (whatsapp.substring(0, 2) !== "62") {
      return showErrorDialog("Please dont edit 62");
    }
    if (fullname === "") {
      return showErrorDialog("Please Input Full Name");
    }
    setOverlayLoading(true);

    const params = {
      user_id: dataId.user_id,
      username: dataId.username,
      fullname: fullname,
      status: status,
      user_email: email,
      user_phone: handphone,
      user_whatsapp: whatsapp,
      is_user_ad: userAd,
      vendor_code: vendorCode === "" ? null : vendorCode,
      purch_org: purchOrg,
      roles: roles,
      is_locked: locked,

      is_reset: dataId.is_reset,
    };
    console.log(params);
    try {
      const response = await dispatch(editItem(params));
      if (response.payload.status === 200) {
        const action = await showSuccessDialog(response.payload.data.message);
        if (action.isConfirmed)
          history.push("/administration/master-user/user");
      } else if (
        response.payload.data.error === "10008" ||
        response.payload.data.error === "10009"
      ) {
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
      } else {
        showErrorDialog(response.payload.data.message);
        setOverlayLoading(false);
      }
    } catch (error) {
      showErrorDialog(error.message);
      setOverlayLoading(false);
    }
  };

  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);

  const columnsDataLog = [
    { text: "action type", dataField: "action_type" },
    { text: "created_user", dataField: "created_user" },
    {
      text: "Action",
      dataField: "action",
      editable: false,

      formatter: (cell, column, row, rowIndex) => {
        return (
          <OverlayTrigger
            overlay={<Tooltip id="products-delete-tooltip">Info</Tooltip>}
          >
            <div
              className="btn btn-icon btn-light btn-hover-danger btn-sm"
              onClick={() =>
                window.open(
                  `/administration/master-user/user/info/${column.datalog_id}`
                )
              }
            >
              <span className="svg-icon svg-icon-md svg-icon-danger">
                <SVG
                  src={toAbsoluteUrl("/media/svg/icons/Code/Info-circle.svg")}
                />
              </span>
            </div>
          </OverlayTrigger>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <LoadingFetchData active={overlayLoading} />
        <CardHeader title="Edit User">
          <CardHeaderToolbar>
            <Button variant="primary" onClick={() => handleShow()}>
              <i className="fa fa-info"></i>
            </Button>
          </CardHeaderToolbar>
        </CardHeader>
        <CardBody>
          <Form>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={2}>
                <b>
                  Username <b className="color-red">*</b>
                </b>
              </Form.Label>
              <Col sm={3}>
                <Form.Control type="text" disabled value={userName} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={2}>
                <b>
                  Fullname <b className="color-red">*</b>
                </b>
              </Form.Label>
              <Col sm={3}>
                <Form.Control
                  type="text"
                  onChange={(e) => {
                    setFullname(e.target.value);
                  }}
                  value={fullname}
                />
              </Col>
            </Form.Group>
            {/* ... (lanjutan form) ... */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={2}>
                <b>Select Purch Org</b>
              </Form.Label>
                <Col sm={3}>
                  <MyComponent
                    selectedPurchOrg={selectedPurchOrg}
                    handlePurchOrgChange={handlePurchOrgChange}
                  />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              {/* ... (lanjutan form) ... */}
            </Form.Group>
            <Row className="mt-6">
              <Button
                variant="light"
                className="mr-3"
                onClick={() => history.goBack()}
              >
                <i className="fa fa-arrow-left"></i>Back
              </Button>
              <Button variant="danger" onClick={handleSave}>
                Save
              </Button>
            </Row>
          </Form>
        </CardBody>
      </Card>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Data Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BootstrapTable
            wrapperClasses="table-responsive"
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            bordered={false}
            keyField="datalog_id"
            data={logs}
            columns={columnsDataLog}
            hover
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserEdit;
