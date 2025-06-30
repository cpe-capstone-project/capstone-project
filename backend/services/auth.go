package services

import (
	"errors"
	"fmt"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

type JwtClaim struct {
	Email       string `json:"email"`
	Role        string `json:"role"`
	UserID      uint   `json:"user_id"`
	ProfileName string `json:"profile_name"`
	ImagePath   string `json:"image_path"`
	jwt.StandardClaims
}

func (j *JwtWrapper) GenerateToken(email, role string, userID uint, profileName, imagePath string) (string, error) {
	claims := &JwtClaim{
		Email:       email,
		Role:        role,
		UserID:      userID,
		ProfileName: profileName,
		ImagePath:   imagePath,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * time.Duration(j.ExpirationHours)).Unix(),
			Issuer:    j.Issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(j.SecretKey))
	if err != nil {
		return "", err
	}

	fmt.Printf("JWT Claims: Email=%s, Role=%s, UserID=%d, ProfileName=%s, ImagePath=%s\n",
		claims.Email, claims.Role, claims.UserID, claims.ProfileName, claims.ImagePath)

	return signedToken, nil
}

func (j *JwtWrapper) ValidateToken(signedToken string) (*JwtClaim, error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JwtClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(j.SecretKey), nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JwtClaim)
	if !ok {
		return nil, errors.New("couldn't parse claims")
	}

	if claims.ExpiresAt < time.Now().Unix() {
		return nil, errors.New("JWT is expired")
	}

	return claims, nil
}
