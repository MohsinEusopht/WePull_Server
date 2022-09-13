const subject = {
    admin_sign_up: "Data Pulled Successfully.",
    user_sign_up: "",
    forgot_password: "WePull - Forgot Password"
};

const template = (templateType, first_name, href) => {
    if(templateType === "admin_sign_up") {
        return "<html><head></head><body style='background-color: #eaeaea;padding-top: 30px;padding-bottom: 30px'><div style='width: 50%;margin-left:auto;margin-right:auto;margin-top: 30px;margin-bottom: 30px;margin-top:20px;border-radius: 5px;background-color: white;height: 100%;padding-bottom: 30px;overflow: hidden'><div style='background-color: white;padding-top: 20px;padding-bottom: 20px;width: 100%;text-align: center'><img src='https://wepull.herokuapp.com/static/media/logo.8f74518041ea8d6273bb.png' width='100px' style='margin: auto'/></div><hr/><p style='padding-left: 10px;padding-right: 10px'>Hi "+first_name+",<br/><br/>Great news! Your data sync with WePull is complete, and all analytics are now available.<br/><br/><a href='"+href+"' style='text-decoration: none;width: 100%'><button style='border-radius: 5px;background-color: #1a2956;color:white;border: none;margin-left: auto;margin-right: auto;padding:10px;cursor: pointer'>View Dashboard</button></a><br/><br/>Our team is always here to help. If you have any questions or need further assistance, contact us via email at support@wepull.io</p></div></body></html>";
    }
    else if(templateType === "forgot_password") {
        return "<html><head></head><body style='background-color: #eaeaea;padding-top: 30px;padding-bottom: 30px'><div style='width: 50%;margin-left:auto;margin-right:auto;margin-top: 30px;margin-bottom: 30px;margin-top:20px;border-radius: 5px;background-color: white;height: 100%;padding-bottom: 30px;overflow: hidden'><div style='background-color: white;padding-top: 20px;padding-bottom: 20px;width: 100%;text-align: center'><img src='https://wepull.herokuapp.com/static/media/logo.8f74518041ea8d6273bb.png' width='100px' style='margin: auto'/></div><hr/><p style='padding-left: 10px;padding-right: 10px'>Hi "+first_name+",<br/><br/>To reset your password please click the button down below.<br/><br/><a href='"+href+"' style='text-decoration: none;width: 100%'><button style='border-radius: 5px;background-color: #1a2956;color:white;border: none;margin-left: auto;margin-right: auto;padding:10px;cursor: pointer'>Reset My Password</button></a><br/><br/>Our team is always here to help. If you have any questions or need further assistance, contact us via email at support@wepull.io</p></div></body></html>";
    }
}

module.exports = {subject, template}