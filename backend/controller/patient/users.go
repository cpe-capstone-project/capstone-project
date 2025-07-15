package patient

import (
	"net/http" 
	"capstone-project/config"
	"capstone-project/entity"

	"github.com/gin-gonic/gin"
)


func ListPatients(c *gin.Context) {

   var users []entity.Patients

   db := config.DB()
   results := db.Preload("Gender").Preload("Role").Find(&users)
   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
       return
   }

   c.JSON(http.StatusOK, users)
}


func GetPatientByID(c *gin.Context) {

   ID := c.Param("id")

   var user entity.Patients

   db := config.DB()
   results := db.Preload("Gender").Preload("Role").First(&user, ID)
   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
       return
   }
   if user.ID == 0 {
       c.JSON(http.StatusNoContent, gin.H{})
       return
   }

   c.JSON(http.StatusOK, user)
}


func UpdatePatient(c *gin.Context) {

   var user entity.Patients

   UserID := c.Param("id")
   db := config.DB()
   result := db.First(&user, UserID)
   if result.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
       return
   }

   if err := c.ShouldBindJSON(&user); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
       return
   }


   result = db.Save(&user)
   if result.Error != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
       return
   }

   c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}


func DeletePatient(c *gin.Context) {


   id := c.Param("id")
   db := config.DB()
   if tx := db.Exec("DELETE FROM Patients WHERE id = ?", id); tx.RowsAffected == 0 {
       c.JSON(http.StatusBadRequest, gin.H{"error": "ERROR: ID NOT FOUND"})
       return
   }

   c.JSON(http.StatusOK, gin.H{"message": "Deleted Account Successful"})
}
func GetProfile(c *gin.Context) {
	emailRaw, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email := emailRaw.(string)

	var patient entity.Patients
	if err := config.DB().Preload("Gender").Where("email = ?", email).First(&patient).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"first_name": patient.FirstName,
		"last_name":  patient.LastName,
		"gender":     patient.GenderID,
		"address":    patient.Address,
		"birthday":   patient.BirthDay.Format("2006-01-02"),
		"phone":      patient.Phone,
		"email":      patient.Email,
		"image":      patient.Image,
	})
}
