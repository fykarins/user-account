import React, { useEffect, useState } from "react";

import { Button, Form, Col, Row } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../../_metronic/_partials/controls";
import { LayoutSplashScreen } from "../../../../_metronic/layout";
import { UserTable } from "./UserTable";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  resetData,
  selectData,
  selectLoading,
  selectPageNo,
  selectPageSize,
  selectTotalRecord,
  fetchAll,
} from "./userSlice";
import { fetchRole, selectRole } from "../role/userroleSlice";
import Select from "react-select";
import { showErrorDialog } from "../../../utility";

export const UserPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const data = useSelector(selectData);
  const dataRole = useSelector(selectRole);
  const loading = useSelector(selectLoading);
  const pageNo = useSelector(selectPageNo);
  const pageSize = useSelector(selectPageSize);
  const totalRecord = useSelector(selectTotalRecord);

  // Filter
  const [username, setUsername] = useState("");
  const [vendor, setVendor] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    // Reset on first load
    dispatch(resetData());

    // Fetch data on first load
    dispatch(
      fetchRole({
        pageNo: 1,
        pageSize: -1,
      })
    );
  }, [dispatch]);

  const roleOptions = dataRole.map((e) => {
    return {
      value: e.role_code,
      label: e.role_description,
    };
  });

  const getValueRole = (value, options) => {
    const return_value = options.filter((val) => value === val.value);
    return return_value;
  };

  const handleRoleChange = (e) => {
    if (e === null) {
      e = undefined;
      setRole("");
    } else {
      setRole(e.value);
    }
  };

  const handleSearch = async () => {
    const params = {
      username: username,
      vendor_code: vendor,
      roles: role,
      pageNo: 1,
      pageSize: 10,
    };
    try {
      const response = await dispatch(fetchAll(params));
      if (response.payload.data.status === 200) {
      } else if (
        response.payload.data.error === "10008" ||
        response.payload.data.error === "10009"
      ) {
        const action = await showErrorDialog(response.payload.data.message);
        if (action.isConfirmed) await history.push("/logout");
      } else {
        showErrorDialog(response.payload.data.message);
      }
    } catch (error) {
      showErrorDialog(error.message);
    }
  };

  const handleTableChange = async (
    type,
    { page, sizePerPage, sortField, sortOrder, data }
  ) => {
    if (type === "pagination") {
      const params = {
        username: username,
        vendor_code: vendor,
        roles: role,
        pageNo: page,
        pageSize: sizePerPage,
      };
      try {
        const response = await dispatch(fetchAll(params));
        if (response.payload.data.status === 200) {
        } else if (
          response.payload.data.error === "10008" ||
          response.payload.data.error === "10009"
        ) {
          const action = await showErrorDialog(response.payload.data.message);
          if (action.isConfirmed) await history.push("/logout");
        } else {
          showErrorDialog(response.payload.data.message);
        }
      } catch (error) {
        showErrorDialog(error.message);
      }
    } else {
      let result;
      if (sortOrder === "asc") {
        result = data.sort((a, b) => {
          if (a[sortField] > b[sortField]) {
            return 1;
          } else if (b[sortField] > a[sortField]) {
            return -1;
          }
          return 0;
        });
        console.log(result, "asc");
      } else {
        result = data.sort((a, b) => {
          if (a[sortField] > b[sortField]) {
            return -1;
          } else if (b[sortField] > a[sortField]) {
            return 1;
          }
          return 0;
        });
        console.log(result, "desc");
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return loading ? (
    <LayoutSplashScreen />
  ) : (
    <Card>
      <CardHeader title="User">
        <CardHeaderToolbar>
          <Button
            className="btn btn-danger"
            onClick={() =>
              history.push("/administration/master-user/user/create")
            }
          >
            Create
          </Button>
        </CardHeaderToolbar>
      </CardHeader>
      <CardBody>
        {/* Filter */}
        <Form>
          <Form.Group as={Row}>
            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Username</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    value={username}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Vendor</b>
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    type="text"
                    placeholder="Vendor"
                    onChange={(e) => {
                      setVendor(e.target.value);
                    }}
                    value={vendor}
                    onKeyPress={handleKeyPress}
                  />
                </Col>
              </Form.Group>
            </Col>
            {/* Right Row */}
            <Col sm={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  <b>Role</b>
                </Form.Label>
                <Col sm={6} onKeyPress={handleKeyPress}>
                  <Select
                    isClearable={true}
                    options={roleOptions}
                    value={getValueRole(role, roleOptions)}
                    placeholder="Select role"
                    onChange={handleRoleChange}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Col sm={1}>
                  <Button className="btn btn-danger" onClick={handleSearch}>
                    Search
                  </Button>
                </Col>
              </Form.Group>
            </Col>
          </Form.Group>
        </Form>

        {/* Table */}
        {data && data.length > 0 && (
          <UserTable
            data={data}
            page={pageNo}
            sizePerPage={pageSize}
            totalSize={totalRecord}
            onTableChange={handleTableChange}
            loading={loading}
          />
        )}
      </CardBody>
    </Card>
  );
};
