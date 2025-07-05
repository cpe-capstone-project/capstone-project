package config

import (
	"capstone-project/entity"
)
func SetupPsychologistDatabase() {
    db.AutoMigrate(
        &entity.Roles{},         // ต้องมั่นใจว่าสร้าง Role ก่อน
        &entity.Psychologist{},  // แล้วจึง Psychologist
    )
}
