import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { 
  Typography,
  Button,
  IconButton,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CSVIcon from "../../assets/icons/csv.png";
import { UserRoundPlus, Pencil, Trash2 } from 'lucide-react';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import Loading from "../../components/loading/Loading";
import AutoComplete from '../../components/auto-complete/AutoComplete';
import PaginationComponent from '../../components/pagination/Pagination';
import TextBox from '../../components/text-box/TextBox';

// Types
import { 
  User, 
  UserResponse,
  FileUploadResponse, 
} from "../../features/types";

// Constant
import { MANAGE_USER_ROW_PER_PAGES } from "../../constants/dropdown";

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage, PopupMessageWithCancel } from '../../utils/popupMessage';
import { reformatString, formatNumber, formatPhone, formatThaiID } from '../../utils/commonFunction';
import dayjs from 'dayjs';


interface FormData {
  name: string
  userPermissionId: number
  statusId: number
};

interface ManageUserProps {

}

const ManageUser: React.FC<ManageUserProps> = ({}) => {
  const { isOpen } = useHamburger();
  const navigate = useNavigate();
  const { CENTER_API } = getUrls();

  // State
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const [userPermissionOptions, setUserPermissionOptions] = useState<{ label: string ,value: number }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string ,value: number }[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(MANAGE_USER_ROW_PER_PAGES[MANAGE_USER_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(MANAGE_USER_ROW_PER_PAGES);

  // i18n
  const { t, i18n } = useTranslation();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const [formData, setFormData] = useState<FormData>({
    name: "",
    userPermissionId: 0,
    statusId: 2,
  });

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
  }, [])

  useEffect(() => {
    if (sliceDropdown.userGroups && sliceDropdown.userGroups.data) {
      const options = sliceDropdown.userGroups.data.map((row) => ({
        label: reformatString(row.group_name),
        value: row.id,
      }))
      setUserPermissionOptions(options);
    }
  }, [sliceDropdown.userGroups]);

  useEffect(() => {
    if (sliceDropdown.status && sliceDropdown.status.data) {
      const options = sliceDropdown.status.data.map((row) => ({
        label: row.status,
        value: row.id,
      }))
      setStatusOptions([{label: t('dropdown.all-status'), value: 2}, ...options]);
    }
  }, [sliceDropdown.status, i18n.language, i18n.isInitialized]);

  const fetchUsers = async (page: number, limit: number, filter?: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<UserResponse>(combineURL(CENTER_API, "/users/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          page: page.toString(),
          limit: limit.toString(),
          ...(filter ? { filter } : {})
        }
      })

      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.pagination.maxPage);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUserPermissionChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("userPermissionId", value.value);
    }
    else {
      handleDropdownChange("userPermissionId", 0);
    }
  };

  const handleStatusChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("statusId", value.value);
    }
    else {
      handleDropdownChange("statusId", 2);
    }
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value);
    setRowsPerPage(limit);
    fetchUsers(page, limit);
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
    fetchUsers(value, rowsPerPage);
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      setPage(pageInput);
    }
  };

  const handlePageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');

    if (cleaned) {
      const numberInput = Number(cleaned);
      if (numberInput > 0 && numberInput <= totalPages) {
        setPageInput(numberInput);
      }
    }
    else if (cleaned === "") {
      setPageInput(1);
    }
    return cleaned;
  }

  const handleEdit = (id: number) => {
    goToAddEditUser(true, users.filter(user => user.id === id)[0])
  }

  const handleDelete = async (data: User) => {
    try {
      const confirmed = await PopupMessageWithCancel(t('message.warning.delete-confirmation'), t('message.warning.delete-confirmation-message'), t('button.confirm'), t('button.cancel'), "warning", "#b91c1c")
      
      if (!confirmed) return;

      if (data.image_url) {
        const body = JSON.stringify({
          urls: [data.image_url]
        })
  
        await fetchClient<FileUploadResponse>(combineURL(CENTER_API, `/upload/remove`), {
          method: "POST",
          body,
        })
      }

      const deleteUser = await fetchClient<UserResponse>(combineURL(CENTER_API, `/users/delete`), {
        method: "DELETE",
        queryParams: {
          ids: [data.id].toString()
        },
      })

      if (!deleteUser.success) {
        PopupMessage(t('message.error.error-while-deleting-data'), "", "error");
        return;
      };

      PopupMessage(t('message.success.delete-success'), "", "success");
      fetchUsers(1, rowsPerPage);
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-deleting-data'), errorMessage, "error");
    }
  }

  const goToAddEditUser = (isEdit: boolean, user: User | null = null) => {
    navigate(`/center/manage-user/add-edit-user`, { state: { allowed: true, isEdit, user: user } });
  };

  const exportToCsv = () => {
    const columnLabels = {
      prefix: t('csv.column.prefix'),
      firstName: t('csv.column.first-name'),
      lastName: t('csv.column.last-name'),
      idCard: t('csv.column.id-card'),
      dob: t('csv.column.dob'),
      phone: t('csv.column.phone'),
      email: t('csv.column.email'),
      position: t('csv.column.position'),
      agency: t('csv.column.agency'),
      role: t('csv.column.role'),
      status: t('csv.column.status'),
    };

    const headerRow = { ...columnLabels };

    const dataRows = users.map((data) => ({
      prefix: sliceDropdown.prefix?.data.find(prefix => prefix.id === data.title_id)?.title_th ?? "-",
      firstName: data.firstname,
      lastName: data.lastname,
      idCard: formatThaiID(data.idcard),
      dob: data.dob ? dayjs(data.dob).format("DD/MM/YYYY") : "-",
      phone: formatPhone(data.phone),
      email: data.email,
      position: data.job_position,
      agency: data.agency,
      role: reformatString(sliceDropdown.userGroups?.data.find(userGroup => userGroup.id === data.permissions.userRoleId)?.group_name ?? "-"),
      status: reformatString(data.status),
    }));

    const csvData = [
      { [Object.keys(columnLabels)[0]]: t('csv.user-list') }, // title row
      {},
      headerRow,
      ...dataRows
    ];

    const ws = XLSX.utils.json_to_sheet(csvData, { skipHeader: true });
    let csvContent = XLSX.utils.sheet_to_csv(ws, { FS: "," });

    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });

    const date = dayjs().format("DDMMYYYY");
    const csvName = `${t('csv.user-list')}_${date}.csv`;

    downloadCsv(csvName, URL.createObjectURL(blob));
  }

  const downloadCsv = (csvName: string, url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", csvName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleSearch = async () => {
    const filterParts = [];

    if (formData.name.trim() !== "") {
      filterParts.push(`firstname~${formData.name}`);
      filterParts.push(`lastname~${formData.name}`);
    }
    if (formData.userPermissionId !== 0) {
      filterParts.push(`user_group_id=${formData.userPermissionId}`);
    }
    if (formData.statusId !== 2) {
      filterParts.push(`status=${statusOptions.find(status => status.value === formData.statusId)?.label.toLowerCase()}`);
    }

    await fetchUsers(1, rowsPerPage, filterParts.join(","));
  }

  return (
    <div id='manage-user' className={`main-content ${isOpen ? "pl-[130px]" : "pl-[10px]"} transition-all duration-500`}>
      { isLoading && <Loading /> }
      <div className='flex flex-col w-full pr-[20px]'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.manage-user.title')}</Typography>

        {/* Filter Part */}
        <div className='flex-none mt-2'>
          <div className={`grid grid-cols-3 gap-y-3 gap-x-[5%]`}>
            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="name"
              label={t('component.search-name')}
              placeholder={t('placeholder.search-name')}
              value={formData.name}
              onChange={(event) =>
                handleTextChange("name", event.target.value)
              }
            />

            <AutoComplete 
              id="user-permission-select"
              sx={{ marginTop: "10px"}}
              value={formData.userPermissionId}
              onChange={handleUserPermissionChange}
              options={userPermissionOptions}
              label={t('component.user-permission')}
              placeholder={t('placeholder.user-permission')}
              labelFontSize="15px"
            />

            <AutoComplete 
              id="status-select"
              sx={{ marginTop: "10px"}}
              value={formData.statusId}
              onChange={handleStatusChange}
              options={statusOptions}
              label={t('component.status')}
              placeholder={t('placeholder.status')}
              labelFontSize="15px"
            />

            <div className='col-start-2 row-start-3 row-span-3 w-full'>
              <div className='flex items-center justify-center h-full gap-x-2'>
                <Button
                  type='submit'
                  variant="contained"
                  className="primary-btn"
                  startIcon={<SearchIcon />}
                  sx={{ 
                    width: t('button.search-width'),
                    textTransform: "capitalize",
                  }}
                  onClick={handleSearch}
                >
                  {t('button.search')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between mt-2'>
          <div className='flex'>
            <label>{`${t('table.amount')} ${formatNumber(users.length)} ${t('table.list')}`}</label>
          </div>
          {/* Button Part */}
          <div className='flex gap-2'>
            <IconButton 
              className="tertiary-btn"
              sx={{
                borderRadius: "4px !important",
              }}
              onClick={exportToCsv}
              disabled={users.length === 0}
            >
              <img src={CSVIcon} alt='CSV Icon' className='w-[20px] h-[20px]' />
            </IconButton>

            <Button
              variant="contained"
              className="primary-btn"
              startIcon={<UserRoundPlus />}
              sx={{
                width: t('button.add-new-user-width'),
                height: "40px",
                textTransform: "capitalize",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                } 
              }}
              onClick={() => goToAddEditUser(false)}
            >
              {t('button.add-new-user')} 
            </Button>
          </div>
        </div>

        {/* Result Table */}
        <div>
          <TableContainer
            component={Paper} 
            className='mt-2'
            sx={{ height: "60vh", backgroundColor: "transparent" }}
          >
            <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#242727", position: "sticky", top: 0, zIndex: 1 }}>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "4%" }}>{t('table.column.prefix')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "12%" }}>{t('table.column.full-name')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.position')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.agency')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.user-permission')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>{t('table.column.status')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>{t('table.column.edit-delete')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "#48494B" }}>
                {
                  users.map((data, index) => (
                    <TableRow key={index}>
                      {
                        (() => {
                          const titleName = sliceDropdown.prefix?.data.find(prefix => prefix.id === data.title_id)?.title_th ?? "-";
                          return (
                            <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", textAlign: "center", borderBottom: "1px dashed #ADADAD" }}>{titleName}</TableCell>
                          )
                        })()
                      }
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{data.firstname} {data.lastname}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{data.job_position}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{data.agency}</TableCell>
                      {
                        (() => {
                          const groupName = sliceDropdown.userGroups?.data.find(userGroup => userGroup.id === data.permissions.userRoleId)?.group_name ?? "";
                          return (
                            <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{reformatString(groupName)}</TableCell>
                          )
                        })()
                      }
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", textAlign: "center" }}>
                        {
                          (() => {
                            const color = data.status === "active" ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                            return (
                              <label
                                className={`w-[80px] h-[30px] inline-flex items-center justify-center rounded
                                ${color}`}
                              >
                                { reformatString(data.status) }
                              </label>
                            )
                          })()
                        }
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>
                        <div className='flex items-center justify-center gap-1'>
                          <IconButton
                            sx={{
                              borderRadius: "4px !important",
                            }}
                            onClick={() => handleEdit(data.id)}
                          >
                            <Pencil color='#FFFFFF' size={20} />
                          </IconButton>

                          <IconButton
                            sx={{
                              borderRadius: "4px !important",
                            }}
                            onClick={ () => handleDelete(data)}
                          >
                            <Trash2 color='#FFFFFF' size={20} />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Part */}
          <div className={`${users.length > 0 ? "flex" : "hidden"} items-center justify-between bg-[var(--background-color)] py-3 pl-1 sticky bottom-0`}>
            <PaginationComponent 
              page={page} 
              onChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              handleRowsPerPageChange={handleRowsPerPageChange}
              totalPages={totalPages}
              pageInput={pageInput.toString()}
              handlePageInputKeyDown={handlePageInputKeyDown}
              handlePageInputChange={handlePageInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageUser;