class ApiResponse{
    constructor(statusCode,data="No data sent",message="Success",) {
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode<400
    }
}

export default ApiResponse