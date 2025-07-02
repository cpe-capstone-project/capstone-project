package services

import (
	"errors"
	"fmt"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

// JwtWrapper wraps the signing key and the issuer
type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

// JwtClaim adds email, role, and branchID as claims to the token
type JwtClaim struct {
	Email    string `json:"email"`
	Role     string `json:"role"`      // ฟิลด์ Role
	jwt.StandardClaims
}

// GenerateToken generates a jwt token with email, role, and branchID
func (j *JwtWrapper) GenerateToken(email string, role string) (signedToken string, err error) {
	claims := &JwtClaim{
		Email:    email,
		Role:     role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(time.Hour * time.Duration(j.ExpirationHours)).Unix(),
			Issuer:    j.Issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err = token.SignedString([]byte(j.SecretKey))
	if err != nil {
		return
	}

	return
}

// ValidateToken validates the jwt token and extracts the claims
func (j *JwtWrapper) ValidateToken(signedToken string) (claims *JwtClaim, err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JwtClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(j.SecretKey), nil
		},
	)

	if err != nil {
		return
	}

	claims, ok := token.Claims.(*JwtClaim)
	if !ok {
		err = errors.New("couldn't parse claims")
		return
	}

	if claims.ExpiresAt < time.Now().Local().Unix() {
		err = errors.New("JWT is expired")
		return
	}

	// เพิ่ม Log เพื่อ Debug ค่า Claims
	fmt.Printf("JWT Claims: Email=%s, Role=%s\n", claims.Email, claims.Role)

	return
}