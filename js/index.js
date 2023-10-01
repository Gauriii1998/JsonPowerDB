const jpdbBaseURL = 'http://api.login2explore.com:5577';
const jpdbIRL = '/api/irl';
const jpdbIML = '/api/iml';
const studentDBName = 'STUDENT-TABLE';
const stuRelationName = 'SCHOOL-DB';
const connToken = '90931660|-31949326869697651|90961465';

function getStuIdAsJsonObj(student_id) {
  var jsonStrObj = {
    rollnum: Number(student_id),
  };
  return JSON.stringify(jsonStrObj);
}

var currentStudent_rec_no = 0;

function resetForm() {
  enableForm();
  disableAllButtons();
  $('#stuname').val('').prop('disabled', true);
  $('#stuclass').val('').prop('disabled', true);
  $('#stuenrollmentdate').val('').prop('disabled', true);
  $('#stubirthdate').val('').prop('disabled', true);
  $('#stuaddress').val('').prop('disabled', true);
  $('#sturollnum').val('').focus();
}

function resetFields() {
  $('#stuname').val('');
  $('#stuclass').val('');
  $('#stuenrollmentdate').val('');
  $('#stubirthdate').val('');
  $('#stuaddress').val('');
}

function disableAllButtons() {
  $('#saveForm').prop('disabled', true);
  $('#updateForm').prop('disabled', true);
  $('#resetForm').prop('disabled', true);
}

function getStudent(event) {
  //check value is number
  const rollnum = event.target.value;
  if (rollnum === '' || isNaN(Number(rollnum))) {
    return;
  }
  var rollnumdJsonObj = getStuIdAsJsonObj(rollnum);

  var getRequest = createGET_BY_KEYRequest(
    connToken,
    studentDBName,
    stuRelationName,
    rollnumdJsonObj
  );

  jQuery.ajaxSetup({ async: false });

  var resJsonObj = executeCommandAtGivenBaseUrl(
    getRequest,
    jpdbBaseURL,
    jpdbIRL
  );

  jQuery.ajaxSetup({ async: true });

  if (resJsonObj.status === 200) {
    enableUpdate(resJsonObj.data);
  } else {
    enableSave();
  }
}

function fillDataInfields(record = {}) {
  $('#stuname').val(record.name ? record.name : '');
  $('#stuclass').val(record.class ? record.class : '');
  $('#stuenrollmentdate').val(
    record.enrollmentdate ? record.enrollmentdate : ''
  );
  $('#stubirthdate').val(record.birthdate ? record.birthdate : '');
  $('#stuaddress').val(record.address ? record.address : '');
  enableAllFields();
}

function enableAllFields() {
  $('#stuname').prop('disabled', false);
  $('#stuclass').prop('disabled', false);
  $('#stuenrollmentdate').prop('disabled', false);
  $('#stubirthdate').prop('disabled', false);
  $('#stuaddress').prop('disabled', false);
}

function enableSave() {
    disableAllButtons();
  $('#saveForm').prop('disabled', false);
  $('#resetForm').prop('disabled', false);
  enableAllFields();
  resetFields();
}

function enableUpdate(response) {
  const data = JSON.parse(response);
  const { record, rec_no } = data;
  currentStudent_rec_no = rec_no;
  console.log(record);
  fillDataInfields(record);
  disableAllButtons();
  $('#updateForm').prop('disabled', false);
  $('#resetForm').prop('disabled', false);
}

function disableForm() {
  $('#studentform').prop('disabled', true);
}

function enableForm() {
  $('#studentform').prop('disabled', false);
}

const debounceGetStudent = _.debounce(getStudent, 500);

function saveData() {
  disableForm();
  var jsonStrObj = validateData();
  if (jsonStrObj === undefined) {
    return;
  }

  var putRequest = createPUTRequest(
    connToken,
    jsonStrObj,
    studentDBName,
    stuRelationName
  );
  jQuery.ajaxSetup({ async: false });
  var resJsonObj = executeCommandAtGivenBaseUrl(
    putRequest,
    jpdbBaseURL,
    jpdbIML
  );
  if (resJsonObj.status !== 200) {
    alert('Error in saving record');
  }
  jQuery.ajaxSetup({ async: true });
  resetForm();
}

function validateData() {
  var sturollnum = $('#sturollnum').val();
  var stuname = $('#stuname').val();
  var stuclass = $('#stuclass').val();
  var stuenrollmentdate = $('#stuenrollmentdate').val();
  var stubirthdate = $('#stubirthdate').val();
  var stuaddress = $('#stuaddress').val();

  if (sturollnum === '') {
    alert('Student-Roll number is missing');
    $('#sturollnum').focus();
    return;
  }

  if (stuname === '') {
    alert('Student Full-Name is missing');
    $('#stuname').focus();
    return;
  }

  if (stuclass === '') {
    alert('Student Class is missing');
    $('#stuclass').focus();
    return;
  }

  if (stuenrollmentdate === '') {
    alert('Enrollment Date is mussing');
    $('#stuenrollmentdate').focus();
    return;
  }

  if (stubirthdate === '') {
    alert('Birth Date is missing');
    '$stubirthdate'.focus();
    return;
  }

  if (stuaddress === '') {
    alert('Address is missing');
    '$stuaddress'.focus();
    return;
  }

  var jsonStrObj = {};

  /* if (isUpdate) {
    jsonStrObj = {
      name: stuname,
      class: stuclass,
      enrollmentdate: stuenrollmentdate,
      birthdate: stubirthdate,
      address: stuaddress,
    };
  } else { */
  jsonStrObj = {
    rollnum: Number(sturollnum),
    name: stuname,
    class: stuclass,
    enrollmentdate: stuenrollmentdate,
    birthdate: stubirthdate,
    address: stuaddress,
    /*  }; */
  };
  return JSON.stringify(jsonStrObj);
}

function updateData() {
  disableForm();
  jsonUpd = validateData();
  var updateRequest = createUPDATERecordRequest(
    connToken,
    jsonUpd,
    studentDBName,
    stuRelationName,
    currentStudent_rec_no
  );
  jQuery.ajaxSetup({ async: false });
  var resJsonObj = executeCommandAtGivenBaseUrl(
    updateRequest,
    jpdbBaseURL,
    jpdbIML
  );
  jQuery.ajaxSetup({ async: true });
  resetForm();
}

$(() => {
  resetForm();
  $('#saveForm').on('click', () => {
    saveData();
  });
  $('#updateForm').on('click', () => {
    updateData();
  });
  $('#resetForm').on('click', () => {
    resetForm();
  });
  $('#sturollnum').keydown((event) => {
    debounceGetStudent(event);
  });
});
