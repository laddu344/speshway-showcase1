# Cloudinary Image Upload Setup

## Configuration

Cloudinary has been integrated for image storage for Projects and Team members.

### Environment Variables

Add these to your `backend/.env` file:

```
CLOUDINARY_CLOUD_NAME=charan12
CLOUDINARY_API_KEY=478681192216688
CLOUDINARY_API_SECRET=du1JrEvTmjfmDiDa-Yi9cfP4MWc
```

## Features

### Portfolio Images
- Upload location: `speshway/portfolios/`
- Image optimization: 1200x800px (limit crop, auto quality)
- Max file size: 5MB
- Supported formats: JPG, JPEG, PNG, WEBP

### Team Images
- Upload location: `speshway/team/`
- Image optimization: 500x500px (fill crop with face detection, auto quality)
- Max file size: 5MB
- Supported formats: JPG, JPEG, PNG, WEBP

## Usage

### Admin Panel

1. **Adding Project Image:**
   - Go to Admin Dashboard → Manage Projects
   - Click "Add New Project" or edit existing project
   - Click the image upload area
   - Select an image file
   - Preview will show immediately
   - Click "Create" or "Update" to save

2. **Adding Team Member Image:**
   - Go to Admin Dashboard → Manage Team
   - Click "Add New Team Member" or edit existing member
   - Click the image upload area
   - Select a profile image
   - Preview will show immediately
   - Click "Create" or "Update" to save

### Image Management

- Images are automatically uploaded to Cloudinary
- Old images are deleted when updating with a new image
- Images are deleted from Cloudinary when projects/team members are deleted
- Images are optimized automatically for web performance

## Display

- **Portfolio Page**: Shows project images with hover zoom effect
- **Team Page**: Shows team member photos with smooth transitions
- **Admin Panel**: Shows image previews in the management cards

## API Endpoints

- `POST /api/portfolios` - Create project with image
- `PUT /api/portfolios/:id` - Update project (with optional new image)
- `POST /api/team` - Create team member with image
- `PUT /api/team/:id` - Update team member (with optional new image)

All endpoints accept `multipart/form-data` with an `image` field.

