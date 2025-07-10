# SAML SSO Setup Guide

## Overview
This guide will help you configure SAML Single Sign-On (SSO) for your Rhythm90 workspace. SAML SSO allows your team to authenticate using your existing identity provider (IdP) such as Okta, Azure AD, or Google Workspace.

## Prerequisites
- Admin access to your Rhythm90 workspace
- Access to your identity provider (IdP) configuration
- Your IdP's SAML metadata or configuration details

## Step 1: Configure Rhythm90 SAML Settings

### 1.1 Access SAML Configuration
1. Log in to your Rhythm90 workspace as an admin
2. Navigate to **Enterprise** → **SAML Single Sign-On**
3. You'll see the SAML configuration form

### 1.2 Enter SAML Configuration Details

#### Entity ID
- **Format**: `https://your-domain.com/saml`
- **Example**: `https://acme.rhythm90.io/saml`
- **Description**: A unique identifier for your Rhythm90 service provider

#### ACS URL (Assertion Consumer Service)
- **Format**: `https://rhythm90.io/saml/acs`
- **Description**: The endpoint where your IdP will send SAML responses

#### Certificate
- **Format**: X.509 certificate in PEM format
- **Description**: Your IdP's signing certificate for validating SAML responses

### 1.3 Test Configuration
1. Click **Test Connection** to validate your SAML configuration
2. Ensure all required fields are properly configured
3. Address any validation errors before proceeding

## Step 2: Configure Your Identity Provider

### 2.1 Add Rhythm90 as a Service Provider

#### For Okta:
1. Go to **Applications** → **Create App Integration**
2. Select **SAML 2.0**
3. Configure the following settings:
   - **Single sign on URL**: `https://rhythm90.io/saml/acs`
   - **Audience URI (SP Entity ID)**: `https://your-domain.com/saml`
   - **Name ID format**: `EmailAddress`
   - **Application username**: `Email`

#### For Azure AD:
1. Go to **Enterprise applications** → **New application**
2. Select **Create your own application**
3. Choose **Integrate any other application you don't find in the gallery (Non-gallery)**
4. Configure SAML settings:
   - **Identifier (Entity ID)**: `https://your-domain.com/saml`
   - **Reply URL**: `https://rhythm90.io/saml/acs`

#### For Google Workspace:
1. Go to **Admin console** → **Apps** → **Web and mobile apps**
2. Click **Add custom SAML app**
3. Configure:
   - **ACS URL**: `https://rhythm90.io/saml/acs`
   - **Entity ID**: `https://your-domain.com/saml`

### 2.2 Attribute Mapping
Configure the following attribute mappings in your IdP:

| Rhythm90 Attribute | IdP Attribute | Description |
|-------------------|---------------|-------------|
| Email | `email` or `user.email` | User's email address |
| Name | `name` or `user.name` | User's display name |
| Groups | `groups` or `user.groups` | User's group memberships (optional) |

### 2.3 Download IdP Metadata
1. Download your IdP's SAML metadata (usually available as XML)
2. Note the Entity ID and certificate details
3. Keep this information for the next step

## Step 3: Complete SAML Configuration

### 3.1 Update Rhythm90 Settings
1. Return to the Rhythm90 SAML configuration page
2. Update the Entity ID with your IdP's Entity ID
3. Upload or paste your IdP's certificate
4. Click **Test Connection** to verify the configuration

### 3.2 Enable SAML SSO
1. Once the test is successful, click **Enable SSO**
2. Confirm the activation
3. Your SAML SSO is now active

## Step 4: User Provisioning

### 4.1 Automatic User Creation
- New users will be automatically created when they first sign in via SAML
- Users will be assigned to your team based on their email domain
- Admin users can manage user roles and permissions

### 4.2 User Attributes
The following user attributes are supported:
- **Email**: Required for user identification
- **Name**: Display name in the application
- **Groups**: For role-based access control (if configured)

## Step 5: Testing and Validation

### 5.1 Test User Login
1. Have a test user attempt to sign in via SAML
2. Verify they can access the application
3. Check that their attributes are correctly mapped

### 5.2 Troubleshooting
Common issues and solutions:

#### "Invalid SAML Response"
- Verify the certificate is correctly configured
- Check that the Entity ID matches between IdP and SP
- Ensure the ACS URL is correct

#### "User Not Found"
- Verify email attribute mapping
- Check that the user exists in your IdP
- Ensure the user's email domain matches your team's domain

#### "Access Denied"
- Check user group assignments in your IdP
- Verify role mapping configuration
- Contact your Rhythm90 admin for user permissions

## Security Considerations

### 6.1 Certificate Management
- Regularly rotate your SAML certificates
- Use strong, valid certificates from trusted CAs
- Monitor certificate expiration dates

### 6.2 Access Control
- Configure appropriate group-based access in your IdP
- Regularly review user access and permissions
- Implement least-privilege access principles

### 6.3 Monitoring
- Monitor SAML login attempts and failures
- Set up alerts for unusual authentication patterns
- Regularly review audit logs

## Support and Troubleshooting

### Getting Help
If you encounter issues during setup:

1. **Check the Test Connection** feature for validation errors
2. **Review your IdP's SAML configuration** for common issues
3. **Contact Rhythm90 Support** with specific error messages
4. **Provide SAML logs** if available for debugging

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid certificate" | Certificate format or content issue | Verify certificate is in PEM format and valid |
| "Entity ID mismatch" | IdP and SP Entity IDs don't match | Update Entity ID in Rhythm90 or IdP configuration |
| "ACS URL not found" | Incorrect ACS URL configuration | Verify ACS URL is `https://rhythm90.io/saml/acs` |
| "User not provisioned" | User doesn't exist in Rhythm90 | Ensure user email domain matches team domain |

## Next Steps

Once SAML SSO is configured:

1. **Train your team** on the new login process
2. **Set up user provisioning** workflows if needed
3. **Configure additional security** features like MFA
4. **Monitor usage** and adjust as needed

---

*For additional support, contact Rhythm90 Support at support@rhythm90.io* 