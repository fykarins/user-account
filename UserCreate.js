import React, { useState, useEffect } from "react";
import { Button, Form, Col, Row, InputGroup } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
} from "../../../../_metronic/_partials/controls";
import { useDispatch, useSelector } from "react-redux";
import { addItem, selectRole, fetchRole } from "./userSlice";
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

export const UserCreate = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const forceUpdate = useForceUpdate();
  const roleData = useSelector(selectRole);
  const user = useSelector(selectUser);
  const vendorData = useSelector(selectVendor);
  const dataBispar = useSelector(selectBispar);

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [handphone, setHandphone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState("Y");
  const [locked, setLocked] = useState("N");
  const [userAd, setUserAd] = useState("Y");
  const [roles, setRoles] = useState([]);
  const [vendorCode, setVendorCode] = useState("");
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [purchOrg, setPurchOrg] = useState("");

  let defaultHandphone = "62";

  let posthandphone = defaultHandphone + handphone;
  let postwhatsapp = defaultHandphone + whatsapp;

  let defaulvendor = vendorCode === "" ? "" : vendorCode.replace("0000", "");

  let defaultUsername = "V" + defaulvendor + "-";

  useEffect(() => {
    async function fetchMyAPI() {
      // Fetch data on first load

      if (user.rolesConcat === "superadmin") {
        await dispatch(
          fetchRole({
            vendor_role: "X,Y,N",
            pageNo: 1,
            pageSize: -1,
          })
        );
      } else {
        await dispatch(
          fetchRole({
            vendor_role: "Y,N",
            pageNo: 1,
            pageSize: -1,
          })
        );
      }

      await dispatch(
        fetchVendor({
          pageNo: 1,
          pageSize: -1,
        })
      );
      await dispatch(
        fetchBispar({
            paramgroup_code: "PURCH_ORG",
            pageNo: 1,
            pageSize: -1,
        })
      );
    }
    fetchMyAPI();
  }, [dispatch, user.rolesConcat]);

  useEffect(() => {
    if (userAd === "Y") {
      setVendorCode("");
    }
  }, [userAd]);

  const handleRoleChange = (selectedOptions) => {
    if (selectedOptions) {
      setRoles(
        // eslint-disable-next-line array-callback-return
        selectedOptions.map(function(selectedOptions) {
          if (selectedOptions) {
            return selectedOptions["value"];
          }
        })
      );
    } else {
      setRoles([]);
    }
  };

  const roleOptions = roleData.map((val) => {
    return {
      value: val.role_code,
      label: val.role_description,
    };
  });

  const purchOrgOptions = dataBispar.map((val) => {
      return {
        value: val.param_code,
        label: val.param_value,
      };
  });

  function getValueRole(roles) {
    let output = [];
    // eslint-disable-next-line array-callback-return
    roles.map((val) => {
      const result = roleOptions.filter((role) => val === role.value);
      output.push(result[0]);
    });
    return output;
  }

  const vendorOptions = vendorData.map((e) => {
    return {
      value: e.lfA1_LIFNR,
      label: e.lfA1_NAME1,
    };
  });

  const getValueVendor = (value, options) => {
    const return_value = options.filter((val) => value === val.value);
    return return_value;
  };

  const getValuePurchOrg = (value, options) => {
    const return_value = options.filter((val) => value === val.value);
    return return_value;
  };

  const handleVendorChange = (e, value) => {
    if (e === null) {
      value.vendorCode = "";
    } else {
      value.vendorCode = e.value;
    }
    setVendorCode(value.vendorCode);
    forceUpdate();
  };

  const filteredRoles = roles.filter(function(currentElement) {
    return currentElement === "adm_vendor" || currentElement === "staff_vendor";
  });

  const handlePurchOrgChange = (e) => {
    if (e === null) {
      e = undefined;
      setPurchOrg("");
    } else {
      setPurchOrg(e.value);
    }
  };
  const handleSave = async () => {
    // Validation
    if (username === "") {
      return showErrorDialog("Please Input Username first");
    }
    if (fullname === "") {
      return showErrorDialog("Please Input fullname first");
    }
    if (posthandphone.substring(2, 3) === "0") {
      return showErrorDialog("Please dont number 0 after +62");
    }
    if (postwhatsapp.substring(2, 3) === "0") {
      return showErrorDialog("Please dont number 0 after +62");
    }
    if (postwhatsapp.length < 3) {
      return showErrorDialog("Please Input No Whatsapp");
    }
    if (roles.length < 1) {
      return showErrorDialog("Please Select Role First");
    }
    if (filteredRoles.length > 0 && vendorCode === "") {
      return showErrorDialog("Please Input Vendor");
    }

    setOverlayLoading(true);

    const name = vendorCode === "" ? username : defaultUsername + username

    const params = {
      username: name.replace(/\s/g, ''),
      fullname: fullname,
      status: status,
      user_email: email,
      user_phone: posthandphone,
      user_whatsapp: postwhatsapp,
      is_user_ad: userAd,
      is_locked: locked,
      vendor_code: vendorCode === "" ? null : vendorCode,
      purch_org: purchOrg,
      roles: roles,
    };
    console.log(params, "params");
    
    try {
      const response = await dispatch(addItem(params));
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

  return (
    <Card>
      <CardHeader title="Create User"></CardHeader>
      <LoadingFetchData active={overlayLoading} />

      <CardBody>
        <Form>
          <Form.Group as={Row} className="mb-3" controlId="formGridUsername">
            <Form.Label column sm={2}>
              <b>
                Username <b className="color-red">*</b>
              </b>
            </Form.Label>
            <Col sm={3}>
              {vendorCode !== "" && (
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">
                    {defaultUsername}
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    value={username}
                  />
                </InputGroup>
              )}
              {vendorCode === "" && (
                <Form.Control
                  type="text"
                  placeholder="Username"
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  value={username}
                />
              )}
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
                placeholder="Fullname"
                onChange={(e) => {
                  setFullname(e.target.value);
                }}
                value={fullname}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              <b>
                Whatsapp Number <b className="color-red">*</b>
              </b>
            </Form.Label>
            <Col sm={3}>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">+62</InputGroup.Text>
                <Form.Control
                  type="number"
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                  }}
                  value={whatsapp}
                />
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
            <Form.Label column sm={2}>
              <b>
                Email <b className="color-red">*</b>
              </b>
            </Form.Label>
            <Col sm={3}>
              <Form.Control
                type="email"
                placeholder="Email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
                required
                pattern=".+@gmail\.com"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid gmail.
              </Form.Control.Feedback>
              <Form.Control.Feedback type="valid">
                Looks good!
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              <b>User AD</b>
            </Form.Label>
            <Col sm={3}>
              <Form>
                <div key={`inline-radio`} className="mb-3">
                  <Form.Check
                    inline
                    label="Yes"
                    name="group1"
                    type="radio"
                    id="inline-radio-1"
                    onChange={(e) => {
                      setUserAd("Y");
                    }}
                    checked={userAd === "Y" ? true : false}
                  />
                  <Form.Check
                    inline
                    label="No"
                    name="group1"
                    type="radio"
                    id="inline-radio-2"
                    onChange={(e) => {
                      setUserAd("N");
                    }}
                    checked={userAd === "N" ? true : false}
                  />
                </div>
              </Form>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
  <Form.Label column sm={2}>
    <b>Vendor</b>
  </Form.Label>
  <Col sm={3}>
    <Select
      isDisabled={userAd === "Y" || !!vendorCode}  
      isClearable={true}
      options={vendorOptions}
      value={getValueVendor(vendorCode, vendorOptions)}
      placeholder="Select vendor"
      onChange={handleVendorChange}
    />
  </Col>
</Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              <b>
                Role <b className="color-red">*</b>
              </b>
            </Form.Label>
            <Col sm={3}>
              <MultiSelectAll
                isDisabled={userAd === "N" ? true : false}
                isClearable={true}
                options={roleOptions}
                value={getValueRole(roles)}
                onChange={handleRoleChange}
                placeholder="Select Role..."
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
  <Form.Label column sm={2}>
    <b>Purch Org</b>
  </Form.Label>
  <Col sm={3}>
    <Select
      isDisabled={userAd === "N" && !!vendorCode}  
      isClearable={true}
      options={purchOrgOptions}
      value={getValuePurchOrg(purchOrg, purchOrgOptions)}
      onChange={handlePurchOrgChange}
      placeholder="Select..."
    />
  </Col>
</Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              <b>Status Locked</b>
            </Form.Label>
            <Col sm={3}>
              <Form>
                <div key={`inline-radio`} className="mb-3">
                  <Form.Check
                    inline
                    label="Unlocked"
                    name="group1"
                    type="radio"
                    id="inline-radio-1"
                    onChange={(e) => {
                      setLocked("N");
                    }}
                    checked={locked === "N" ? true : false}
                  />
                  <Form.Check
                    inline
                    label="Locked"
                    name="group1"
                    type="radio"
                    id="inline-radio-2"
                    onChange={(e) => {
                      setLocked("Y");
                    }}
                    checked={locked === "Y" ? true : false}
                  />
                </div>
              </Form>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              <b>Status</b>
            </Form.Label>
            <Col sm={3}>
              <Form>
                <div key={`inline-radio`} className="mb-3">
                  <Form.Check
                    inline
                    label="Active"
                    name="group1"
                    type="radio"
                    id="inline-radio-1"
                    onChange={(e) => {
                      setStatus("Y");
                    }}
                    checked={status === "Y" ? true : false}
                  />
                  <Form.Check
                    inline
                    label="Not Active"
                    name="group1"
                    type="radio"
                    id="inline-radio-2"
                    onChange={(e) => {
                      setStatus("N");
                    }}
                    checked={status === "N" ? true : false}
                  />
                </div>
              </Form>
            </Col>
          </Form.Group>

          <Row className="mt-6">
            <Button
              variant="light"
              className="mr-3"
              onClick={() => history.push("/administration/master-user/user")}
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
  );
};
